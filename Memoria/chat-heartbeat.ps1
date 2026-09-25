# =====================================================================
# chat-heartbeat.ps1 — Auto-guardado cada 10 min (heartbeat simple)
# Apex Cloud Work · Garett Barrantes
#
# Uso en sesión opencode:
#   $hb = Start-Job -FilePath "F:\apex-cloudworks\Memoria\chat-heartbeat.ps1"
#   ... trabajar ...
#   $hb | Stop-Job; $hb | Remove-Job
#
# Escribe heartbeat en sesion-activa.md cada 10 min.
# Cada 3 heartbeats (30 min) dispara apex-memoria para volcar a bitácora.
# =====================================================================

$ErrorActionPreference = 'Stop'

$IntervalMin       = 10
$FlushEvery        = 3
$BufferPath        = 'F:\apex-cloudworks\Memoria\sesion-activa.md'
$MemoriaDir        = 'F:\apex-cloudworks\Memoria'
$WorkDir           = 'F:\apex-cloudworks'
$LogPath           = Join-Path $MemoriaDir 'chat-heartbeat.log'
$CounterPath       = Join-Path $MemoriaDir '.heartbeat-counter'

function Write-HBLog($msg) {
    $line = "{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    try { Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8 } catch {}
}

function Get-Counter {
    if (Test-Path $CounterPath) { try { return [int](Get-Content $CounterPath -Encoding UTF8) } catch { return 0 } }
    return 0
}

function Set-Counter($n) { 
    Set-Content -LiteralPath $CounterPath -Value $n -Encoding UTF8 
}

function Write-Heartbeat {
    $now = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $raw = Get-Content $BufferPath -Raw -Encoding UTF8
    $block = if ($raw -match '(?s)Bloque:\s*(.+?)\n') { $matches[1].Trim() } else { 'Sin bloque activo' }
    $recentFiles = Get-ChildItem "$WorkDir\proyectos" -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-15) } |
        Select-Object -First 5 -ExpandProperty FullName |
        ForEach-Object { Split-Path $_ -Leaf } | Join-String -Separator ', '
    $recentFiles = if ($recentFiles) { $recentFiles } else { 'ninguno reciente' }

    $entry = @"
### Heartbeat automatico — $now
- Intervalo: ${IntervalMin} min
- Bloque activo: $block
- Archivos recientes (15 min): $recentFiles
"@
    Add-Content -LiteralPath $BufferPath -Value "`n$entry" -Encoding UTF8
    Write-HBLog "Heartbeat #$((Get-Counter)+1) escrito: $now"
}

function Invoke-MemoryFlush {
    $oc = Get-Command opencode.exe, opencode.cmd -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $oc) { $oc = 'C:\Users\garet\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe' }
    if (-not (Test-Path $oc)) { Write-HBLog "opencode no encontrado"; return }

    $prompt = 'Genera el log de recuerdo de memoria de la sesion de trabajo usando la skill apex-memoria. Lee F:\apex-cloudworks\Memoria\sesion-activa.md. Si contiene la marca <!-- SIN-TRABAJO --> o no hay trabajo real, NO generes nada y responde "Sin trabajo para loguear".'
    try {
        $out = & $oc run --dir $WorkDir $prompt 2>&1 | Out-String
        Write-HBLog "Flush OK: $($out.Substring(0, [Math]::Min(300, $out.Length)))"
    } catch { Write-HBLog "Flush FALLO: $($_.Exception.Message)" }
}

# ------- Loop -------
Write-HBLog "=== Heartbeat iniciado (cada ${IntervalMin}min, flush cada $FlushEvery) ==="
$count = Get-Counter

while ($true) {
    Start-Sleep -Seconds ($IntervalMin * 60)
    Write-Heartbeat
    $count = (Get-Counter) + 1
    Set-Counter $count
    if ($count % $FlushEvery -eq 0) { Invoke-MemoryFlush }
}