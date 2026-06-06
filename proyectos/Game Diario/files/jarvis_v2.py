"""
Jarvis v2 — AWS Bedrock + Google Calendar + RPG Progress
Garett | America/Mexico_City
"""

import json
import boto3
import datetime
import pytz
import requests
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODEL_ID     = "anthropic.claude-3-5-sonnet-20241022-v2:0"
REGION       = "us-east-1"
TIMEZONE     = "America/Mexico_City"
ROUTINE_PATH = Path(__file__).parent / "rutina.json"
PROMPT_PATH  = Path(__file__).parent / "system_prompt.txt"
API_URL      = ""   # ← Pega aquí tu API URL del Paso 2
USER_ID      = "garett"

with open(ROUTINE_PATH)  as f: ROUTINE       = json.load(f)
with open(PROMPT_PATH)   as f: SYSTEM_PROMPT = f.read()

bedrock = boto3.client("bedrock-runtime", region_name=REGION)
dynamo  = boto3.resource("dynamodb",      region_name=REGION)
table   = dynamo.Table("garett-rpg")

# ── TIME UTILS ────────────────────────────────────────────────────────────────
def now_local():
    return datetime.datetime.now(pytz.timezone(TIMEZONE))

def current_block():
    now = now_local()
    cur = now.hour * 60 + now.minute
    for block in ROUTINE["schedule"]:
        h, m  = map(int, block["time"].split(":"))
        start = h * 60 + m
        end   = start + block["duration_min"]
        if start <= cur < end:
            return block
    return None

def next_block():
    now = now_local()
    cur = now.hour * 60 + now.minute
    for block in ROUTINE["schedule"]:
        h, m  = map(int, block["time"].split(":"))
        start = h * 60 + m
        if start > cur:
            return block, start - cur
    return None, 0

# ── RPG PROGRESS ──────────────────────────────────────────────────────────────
def get_rpg_progress():
    """Lee el progreso del RPG desde DynamoDB."""
    try:
        profile = table.get_item(
            Key={"userId": USER_ID, "date": "PROFILE"}
        ).get("Item", {})

        today_str = now_local().strftime("%Y-%m-%d")
        today_item = table.get_item(
            Key={"userId": USER_ID, "date": today_str}
        ).get("Item")

        today_checked = {}
        today_pct     = 0
        today_xp      = 0

        if today_item:
            today_checked = json.loads(today_item.get("checked", "{}"))
            today_pct     = int(today_item.get("completionPct", 0))
            today_xp      = int(today_item.get("dayXP", 0))

        return {
            "totalXP":     int(profile.get("totalXP",  0)),
            "level":       int(profile.get("level",    1)),
            "todayXP":     today_xp,
            "todayPct":    today_pct,
            "todayChecked":today_checked,
            "tasksToday":  sum(1 for v in today_checked.values() if v),
        }
    except Exception as e:
        return {"error": str(e)}

def xp_to_level(xp):
    level, threshold, accumulated = 1, 200, 0
    while xp >= accumulated + threshold:
        accumulated += threshold
        level += 1
        threshold = int(threshold * 1.18)
    return level, xp - accumulated, threshold

TITLES = [(1,"Novato Digital"),(3,"Aprendiz Constante"),(5,"Trabajador Incansable"),
          (8,"Maestro de Rutinas"),(12,"Desarrollador Élite"),(18,"Leyenda Productiva")]
def get_title(lvl):
    t = TITLES[0][1]
    for l, n in TITLES:
        if lvl >= l: t = n
    return t

# ── DYNAMIC CONTEXT ───────────────────────────────────────────────────────────
def build_context():
    now    = now_local()
    block  = current_block()
    nxt, mins = next_block()
    rpg    = get_rpg_progress()
    level  = rpg.get("level", 1)
    _, prog, thresh = xp_to_level(rpg.get("totalXP", 0))

    ctx  = f"\n\n== CONTEXTO ACTUAL ==\n"
    ctx += f"Fecha/hora: {now.strftime('%A %d/%m/%Y %H:%M')} ({TIMEZONE})\n"

    if block:
        ctx += f"Bloque activo: {block['title']} (tipo: {block['type']})\n"
    if nxt:
        ctx += f"Próximo bloque en {mins} min: {nxt['title']} a las {nxt['time']}\n"

    ctx += f"\n== RPG PROGRESS ==\n"
    ctx += f"Nivel: {level} — {get_title(level)}\n"
    ctx += f"XP total: {rpg.get('totalXP', 0):,}\n"
    ctx += f"XP para siguiente nivel: {prog}/{thresh}\n"
    ctx += f"Hoy: {rpg.get('tasksToday', 0)} tareas completadas ({rpg.get('todayPct', 0)}%)\n"
    ctx += f"XP ganado hoy: {rpg.get('todayXP', 0)}\n"

    if rpg.get("todayChecked"):
        pending = []
        all_tasks = [
            ("wake","⏰ Alarma"),("shower","🚿 Baño"),("breakfast","🍳 Desayuno"),
            ("netacad","🖥️ Netacad"),("openenglish","🗣️ Open English"),("coding","👨‍💻 Programación"),
            ("duolingo","🦜 Duolingo"),("work1","💻 Bloque 1"),("work2","💻 Bloque 2"),
            ("work3","💻 Bloque 3"),("work4","💻 Bloque 4"),
            ("sunset","🌅 Sunset"),("pokemon","🎮 Pokémon"),
            ("barber","💈 Barber"),("ecopollo","🍗 Ecopocho"),("loop","🌐 Loop"),
            ("licores","🥃 Licores"),("rflx","🚗 RFLX"),
            ("review","✅ Revisión"),("news","📺 Noticias"),("sleep","😴 Dormir"),
        ]
        checked = rpg["todayChecked"]
        pending = [label for tid, label in all_tasks if not checked.get(tid)]
        if pending:
            ctx += f"Tareas pendientes hoy: {', '.join(pending[:5])}"
            if len(pending) > 5: ctx += f" (+{len(pending)-5} más)"
            ctx += "\n"

    return ctx

# ── JARVIS ────────────────────────────────────────────────────────────────────
class Jarvis:
    def __init__(self):
        self.history = []

    def chat(self, user_message):
        self.history.append({"role": "user", "content": user_message})
        system = SYSTEM_PROMPT + build_context()

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "system":   system,
                "messages": self.history,
            }),
            contentType="application/json",
            accept="application/json",
        )
        body  = json.loads(response["body"].read())
        reply = body["content"][0]["text"]
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def reset(self):
        self.history = []

# ── MAIN ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    jarvis = Jarvis()
    print("╔══════════════════════════════════╗")
    print("║     JARVIS v2 — ONLINE  🤖       ║")
    print("╚══════════════════════════════════╝\n")

    rpg = get_rpg_progress()
    print(f"  Nivel {rpg.get('level',1)} | {rpg.get('totalXP',0):,} XP total")
    print(f"  Hoy: {rpg.get('todayPct',0)}% completado\n")

    while True:
        user_input = input("Tú: ").strip()
        if user_input.lower() in ("salir","exit","quit"):
            break
        if not user_input:
            continue
        response = jarvis.chat(user_input)
        print(f"\nJarvis: {response}\n")
