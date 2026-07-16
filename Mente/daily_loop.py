#!/usr/bin/env python3
"""
Apex Cloud Work — Daily Loop
Gestión diaria: genera checklist matutino + cierra noche en LOG.md

Uso:
  python daily_loop.py              # genera template del día
  python daily_loop.py morning      # lo mismo
  python daily_loop.py night        # cierre diario
  python daily_loop.py status       # resumen rápido
"""

import json, os, sys
from datetime import datetime, timedelta
from pathlib import Path

# ── Paths ──
MENTE = Path(__file__).parent
ROOT = MENTE.parent
LOG = ROOT / 'LOG.md'
DAILY = MENTE / 'DAILY.md'
RUTINA = MENTE / 'rutina.json'
TAREAS = MENTE / 'tareas-manuales'

TZ_OFFSET = -6  # Costa Rica UTC-6

def now_cr():
    return datetime.utcnow() + timedelta(hours=TZ_OFFSET)

def load_rutina():
    with open(RUTINA, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_day_name(dt):
    days = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
    return days[dt.weekday()]

def is_bike_day(rutina, day_name):
    return day_name in rutina.get('bike_days', [])

def get_class(rutina, day_name):
    return rutina.get('classes', {}).get(day_name)

# ── MORNING: Generar checklist del día ──
def generate_morning():
    dt = now_cr()
    rutina = load_rutina()
    day_name = get_day_name(dt)
    date_str = dt.strftime('%Y-%m-%d')
    date_display = dt.strftime('%d %B %Y').lstrip('0')

    blocks = rutina['schedule']
    bike = is_bike_day(rutina, day_name)
    clase = get_class(rutina, day_name)

    lines = []
    lines.append(f'# DAILY — {date_display} ({day_name})')
    lines.append('')
    lines.append(f'> Generado automaticamente por `daily_loop.py morning`')
    lines.append(f'> Ultimo update: {dt.strftime("%H:%M")} CST')
    lines.append('')

    # Contexto del dia
    lines.append('## Contexto')
    lines.append(f'- Dia: **{day_name}**')
    if bike:
        lines.append(f'- Bici: **SI** (16:45)')
    if clase:
        lines.append(f'- Clase: **{clase["subject"]}** a las {clase["time"]} ({clase["place"]})')
    lines.append(f'- Horas de trabajo: 9h 30min (5 bloques)')
    lines.append(f'- Horas de aprendizaje: 4h (4 bloques)')
    lines.append('')

    # Metricas del dia anterior
    lines.append('## Metricas de ayer')
    lines.append('| Metrica | Valor |')
    lines.append('|---------|-------|')
    lines.append('| Plata cobrada | $ |')
    lines.append('| Leads nuevos | |')
    lines.append('| Lineas shippeadas | |')
    lines.append('| Bloques completos | /5 |')
    lines.append('')

    # Horario
    lines.append('## Horario')
    lines.append('')

    for b in blocks:
        bid = b['id']
        time = b['time']
        dur = b['duration_min']
        title = b['title']
        btype = b['type']

        # Skip bike si no es dia
        if bid == 'exercise' and not bike:
            lines.append(f'- [ ] `{time}` {title} — **DESCANSO**')
            continue
        # Skip clase si no hay
        if bid == 'work4' and clase:
            lines.append(f'- [ ] `{time}` {title} — **{clase["subject"]} {clase["time"]}**')
            continue

        icon = {'work': '\U0001f525', 'learning': '\U0001f4da', 'morning': '\u2600\ufe0f', 'break': '\U0001f37d\ufe0f', 'health': '\U0001f6b4', 'planning': '\U0001f4cb', 'free': '\U0001f3ae', 'winddown': '\U0001f319', 'sleep': '\U0001f4a4'}.get(btype, '')

        task_note = ''
        if b.get('task_role'):
            task_note = f' — _{b["task_role"]}_' if btype == 'work' else ''

        lines.append(f'- [ ] `{time}` {icon} {title}{task_note} ({dur}min)')

    lines.append('')

    # Bloques de trabajo - detalle
    lines.append('## Bloques de trabajo — que hacer')
    lines.append('')

    work_blocks = [b for b in blocks if b['type'] == 'work']
    for wb in work_blocks:
        lines.append(f'### {wb["title"]}')
        lines.append(f'> {wb.get("task_role", "")}')
        lines.append('')
        lines.append('| # | Tarea | Estado |')
        lines.append('|---|-------|--------|')
        lines.append('| 1 | | \u23f3 |')
        lines.append('| 2 | | \u23f3 |')
        lines.append('| 3 | | \u23f3 |')
        lines.append('')

    # Tareas manuales pendientes
    tareas_files = sorted(TAREAS.glob('tareas-manuales-*.md'), reverse=True)
    if tareas_files:
        lines.append('## Tareas manuales pendientes')
        lines.append(f'> Fuera: `{tareas_files[0].name}`')
        lines.append('')
        lines.append('| # | Tarea | Urgencia |')
        lines.append('|---|-------|----------|')
        lines.append('| 1 | Rotar password RDS | \U0001f534 |')
        lines.append('| 2 | Eliminar PEM del disco | \U0001f534 |')
        lines.append('| 3 | Regenerar N8N key | \U0001f534 |')
        lines.append('| 4 | Configurar Apps Script token | \U0001f534 |')
        lines.append('| 5 | Deploy backend EC2 | \U0001f7e1 |')
        lines.append('| 6 | Cobrar Skindoctors $450 | \U0001f7e1 |')
        lines.append('')

    # Cierre
    lines.append('---')
    lines.append('')
    lines.append('## Cierre del dia (completar a las 22:30)')
    lines.append('')
    lines.append('```')
    lines.append('Plata cobrada: $')
    lines.append('Leads nuevos:')
    lines.append('Lineas shippeadas:')
    lines.append('Bloques completos: /5')
    lines.append('Notas:')
    lines.append('```')
    lines.append('')
    lines.append(f'_Ejecuta `python daily_loop.py night` para guardar en LOG.md_')

    content = '\n'.join(lines)
    with open(DAILY, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'DAILY.md generado para {date_display} ({day_name})')
    print(f'Ubicacion: {DAILY}')
    return content

# ── NIGHT: Cerrar dia en LOG.md ──
def generate_night():
    dt = now_cr()
    day_name = get_day_name(dt)
    date_str = dt.strftime('%Y-%m-%d')

    # Leer DAILY actual
    if not DAILY.exists():
        print('No hay DAILY.md para cerrar. Ejecuta morning primero.')
        return

    daily_content = DAILY.read_text(encoding='utf-8')

    # Buscar la seccion de cierre
    cierre_start = daily_content.find('## Cierre del dia')
    if cierre_start == -1:
        print('No se encontro seccion de cierre en DAILY.md')
        return

    cierre_text = daily_content[cierre_start:]
    print('\n=== CIERRE DE DIA ===')
    print('Lee tu DAILY.md y completa estos datos:\n')

    # Extraer datos del cierre
    lines_to_parse = cierre_text.split('\n')
    metrics = {}
    for line in lines_to_parse:
        if 'Plata cobrada:' in line:
            metrics['plata'] = line.split(':')[1].strip().replace('$', '').strip() or '0'
        elif 'Leads nuevos:' in line:
            metrics['leads'] = line.split(':')[1].strip() or '0'
        elif 'Lineas shippeadas:' in line:
            metrics['lineas'] = line.split(':')[1].strip() or '0'
        elif 'Bloques completos:' in line:
            metrics['bloques'] = line.split(':')[1].strip().replace('/5', '').strip() or '0'
        elif 'Notas:' in line:
            metrics['notas'] = line.split(':')[1].strip() if ':' in line and line.split(':')[1].strip() else ''

    # Generar entrada para LOG.md
    log_entry = f'\n### {date_str} ({day_name}) — Cierre diario\n\n'
    log_entry += f'| Metrica | Valor |\n'
    log_entry += f'|---------|-------|\n'
    log_entry += f'| Plata cobrada | ${metrics.get("plata", "?")} |\n'
    log_entry += f'| Leads nuevos | {metrics.get("leads", "?")} |\n'
    log_entry += f'| Lineas shippeadas | {metrics.get("lineas", "?")} |\n'
    log_entry += f'| Bloques completados | {metrics.get("bloques", "?")}/5 |\n'
    if metrics.get('notas'):
        log_entry += f'\n> {metrics["notas"]}\n'
    log_entry += '\n---\n'

    # Leer LOG.md y buscar la semana actual
    log_content = LOG.read_text(encoding='utf-8')
    semana_marker = f'## Semana'

    # Encontrar donde insertar (despues del header de la semana actual)
    # Buscar la linea que contiene la semana actual
    import re
    semana_match = re.search(rf'## Semana \d+.*{dt.strftime("%B")}', log_content, re.IGNORECASE)

    if semana_match:
        # Insertar despues del header de la semana, antes del primer ---
        insert_pos = log_content.find('\n---', semana_match.end())
        if insert_pos == -1:
            insert_pos = log_content.find('\n## ', semana_match.end())
        if insert_pos == -1:
            insert_pos = len(log_content)
        log_content = log_content[:insert_pos] + '\n' + log_entry + log_content[insert_pos:]
    else:
        # Si no hay header de semana, agregar al final
        log_content += '\n' + log_entry

    with open(LOG, 'w', encoding='utf-8') as f:
        f.write(log_content)

    # Renombrar DAILY como archivado
    archive_name = f'DAILY-{date_str}.md'
    archive_path = MENTE / 'auditorias' / archive_name
    DAILY.rename(archive_path)

    print(f'LOG.md actualizado con cierre del {date_str}')
    print(f'DAILY.md archivado como {archive_name}')

# ── STATUS: Resumen rapido ──
def show_status():
    dt = now_cr()
    day_name = get_day_name(dt)
    rutina = load_rutina()

    bike = is_bike_day(rutina, day_name)
    clase = get_class(rutina, day_name)

    print(f'\n=== APEX DAILY STATUS ===')
    print(f'Fecha: {dt.strftime("%d %B %Y")} ({day_name})')
    print(f'Hora: {dt.strftime("%H:%M")} CST')
    print(f'Bici: {"SI" if bike else "NO"}')
    if clase:
        print(f'Clase: {clase["subject"]} a las {clase["time"]}')
    print()

    # Check if DAILY exists
    if DAILY.exists():
        content = DAILY.read_text(encoding='utf-8')
        checked = content.count('[x]')
        total = content.count('[ ]') + checked
        print(f'DAILY.md: {checked}/{total} tareas completadas')
    else:
        print('DAILY.md: No generado hoy. Ejecuta: python daily_loop.py morning')

    # Check tareas manuales
    tareas_files = sorted(TAREAS.glob('tareas-manuales-*.md'), reverse=True)
    if tareas_files:
        print(f'Tareas manuales: {tareas_files[0].name}')

    print()

# ── Main ──
if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'morning'

    if cmd == 'morning':
        generate_morning()
    elif cmd == 'night':
        generate_night()
    elif cmd == 'status':
        show_status()
    else:
        print(f'Comando desconocido: {cmd}')
        print('Uso: python daily_loop.py [morning|night|status]')
