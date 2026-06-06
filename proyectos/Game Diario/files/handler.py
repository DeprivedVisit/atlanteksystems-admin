"""
Lambda Handler — Garett RPG Sync API
Endpoints:
  GET  /progress         → trae perfil + historial
  POST /progress/save    → guarda el día y actualiza perfil
  GET  /progress/today   → solo el día de hoy
"""

import json
import boto3
import os
from datetime import datetime, timezone
from decimal import Decimal

TABLE  = os.environ.get("DYNAMO_TABLE", "garett-rpg")
REGION = os.environ.get("AWS_REGION",   "us-east-1")
db     = boto3.resource("dynamodb", region_name=REGION)
table  = db.Table(TABLE)

# ── Helpers ───────────────────────────────────────────────────────────────────
def resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body, default=str),
    }

def decimal_to_num(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def xp_to_level(xp):
    level, threshold, accumulated = 1, 200, 0
    while xp >= accumulated + threshold:
        accumulated += threshold
        level += 1
        threshold = int(threshold * 1.18)
    return level, xp - accumulated, threshold

# ── Handlers ──────────────────────────────────────────────────────────────────
def get_progress(user_id):
    """Trae perfil + últimos 30 días del historial."""
    profile_resp = table.get_item(Key={"userId": user_id, "date": "PROFILE"})
    profile = profile_resp.get("Item", {})

    history_resp = table.query(
        KeyConditionExpression="userId = :uid AND #d BETWEEN :start AND :end",
        ExpressionAttributeNames={"#d": "date"},
        ExpressionAttributeValues={
            ":uid":   user_id,
            ":start": "2020-01-01",
            ":end":   "2099-12-31",
        },
        ScanIndexForward=False,
        Limit=30,
    )
    history = [item for item in history_resp.get("Items", []) if item["date"] != "PROFILE"]

    return resp(200, {
        "profile": json.loads(json.dumps(profile, default=decimal_to_num)),
        "history": json.loads(json.dumps(history, default=decimal_to_num)),
    })


def save_day(user_id, body):
    """Guarda el día completado y recalcula el perfil."""
    today     = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    checked   = body.get("checked", {})
    day_xp    = int(body.get("dayXP", 0))
    day_pct   = int(body.get("completionPct", 0))
    unlocked  = body.get("unlocked", [])

    # Guardar día
    table.put_item(Item={
        "userId":        user_id,
        "date":          today,
        "checked":       json.dumps(checked),
        "dayXP":         day_xp,
        "completionPct": day_pct,
        "savedAt":       datetime.now(timezone.utc).isoformat(),
    })

    # Actualizar perfil
    profile_resp = table.get_item(Key={"userId": user_id, "date": "PROFILE"})
    profile = profile_resp.get("Item", {})
    total_xp  = int(profile.get("totalXP", 0)) + day_xp
    level, _, _ = xp_to_level(total_xp)

    table.update_item(
        Key={"userId": user_id, "date": "PROFILE"},
        UpdateExpression="SET totalXP=:xp, #lv=:lv, unlocked=:ul, updatedAt=:ua",
        ExpressionAttributeNames={"#lv": "level"},
        ExpressionAttributeValues={
            ":xp": total_xp,
            ":lv": level,
            ":ul": json.dumps(unlocked),
            ":ua": datetime.now(timezone.utc).isoformat(),
        },
    )

    return resp(200, {
        "saved": True,
        "date": today,
        "totalXP": total_xp,
        "level": level,
    })


def get_today(user_id):
    """Trae solo el día de hoy si existe."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    result = table.get_item(Key={"userId": user_id, "date": today})
    item = result.get("Item")
    if item:
        item["checked"] = json.loads(item.get("checked", "{}"))
    return resp(200, {"today": json.loads(json.dumps(item, default=decimal_to_num)) if item else None})


# ── Main handler ──────────────────────────────────────────────────────────────
def handler(event, context):
    method = event.get("httpMethod", "GET")
    path   = event.get("path", "/")
    uid    = "garett"  # Single user — simplifica la auth

    # CORS preflight
    if method == "OPTIONS":
        return resp(200, {})

    try:
        if method == "GET" and path == "/progress":
            return get_progress(uid)

        elif method == "GET" and path == "/progress/today":
            return get_today(uid)

        elif method == "POST" and path == "/progress/save":
            body = json.loads(event.get("body", "{}"))
            return save_day(uid, body)

        else:
            return resp(404, {"error": "Not found"})

    except Exception as e:
        print(f"ERROR: {e}")
        return resp(500, {"error": str(e)})
