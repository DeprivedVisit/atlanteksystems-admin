# =====================================================================
# afk-watchdog.ps1 — Memoria de sesión automática para opencode
# Apex Cloud Work · Garett Barrantes
#
# Detecta inactividad global (GetLastInputInfo) y, tras $IdleThresholdMin
# minutos con trabajo reciente en el buffer de sesión, lanza `opencode run`
# para que la skill apex-memoria genere el log de recuerdo.
#
# Se registra como tarea programada al logon (ApexAFKWatchdog).
# Reinicio manual:  powershell -ExecutionPolicy Bypass -File <ruta>
# =====================================================================

$ErrorActionPreference = 'Stop'

# ------- Config -------
$IdleThresholdMin = 15                 # minutos de AFK para disparar
$CheckIntervalSec = 120                # cada cuánto revisar
$WorkWindowMin    = 60                 # el buffer debe haberse tocado hace máx. esto
$MemoriaDir       = 'F:\apex-cloudworks\Memoria'
$BufferPath       = Join-Path $MemoriaDir 'sesion-activa.md'
$FlagPath         = Join-Path $MemoriaDir '.last-afk-trigger'
$LogPath          = Join-Path $MemoriaDir 'afk-watchdog.log'
$WorkDir          = 'F:\apex-cloudworks'
$Prompt = 'Genera el log de recuerdo de memoria de la sesion de trabajo usando la skill apex-memoria. ' +
          'Lee F:\apex-cloudworks\Memoria\sesion-activa.md. Si contiene la marca <!-- SIN-TRABAJO --> ' +
          'o no hay trabajo real, NO generes nada y responde "Sin trabajo para loguear".'

# ------- Idle detection (GetLastInputInfo) -------
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class AfkIdle {
    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    public static uint GetIdleSeconds() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        GetLastInputInfo(ref lii);
        return ((uint)Environment.TickCount - lii.dwTime) / 1000u;
    }
}
'@

# ------- Helper: log al archivo del watchdog -------
function Write-WatchLog([string]$msg) {
    $line = "{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    try { Add-Content -LiteralPath $LogPath -Value $line } catch {}
}

# ------- Resolver comando opencode -------
function Get-OpencodeCmd {
    $cmd = Get-Command opencode.exe, opencode.cmd -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { return $cmd.Source }
    $alt = 'C:\Users\garet\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe'
    if (Test-Path -LiteralPath $alt) { return $alt }
    return $null
}

# ------- Generar el log vía opencode -------
function Invoke-MemoryLog {
    param([string]$OpencodeCmd)
    try {
        $out = & $OpencodeCmd run --dir $WorkDir $Prompt 2>&1 | Out-String
        Write-WatchLog "Log generado OK. Salida: $($out.Substring(0, [Math]::Min(400, $out.Length)))"
    }
    catch {
        Write-WatchLog "FALLO al generar log: $($_.Exception.Message)"
    }
    Set-Content -LiteralPath $FlagPath -Value (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -Encoding UTF8
}

# ------- Loop principal -------
Write-WatchLog "Watchdog iniciado (umbral ${IdleThresholdMin}min)."
$oc = Get-OpencodeCmd
if (-not $oc) {
    Write-WatchLog "ERROR: no se encontro el comando opencode. Abortando."
    exit 1
}
Write-WatchLog "opencode: $oc"

while ($true) {
    Start-Sleep -Seconds $CheckIntervalSec
    try {
        $idle = [AfkIdle]::GetIdleSeconds()
        if ($idle -lt ($IdleThresholdMin * 60)) { continue }

        $buffer = Get-Item -LiteralPath $BufferPath -ErrorAction Stop
        $flag   = Get-Item -LiteralPath $FlagPath   -ErrorAction SilentlyContinue
        $lastTrigger = if ($flag) { $flag.LastWriteTime } else { [datetime]::MinValue }

        $recent = $buffer.LastWriteTime -gt (Get-Date).AddMinutes(-$WorkWindowMin)
        $newer  = $buffer.LastWriteTime -gt $lastTrigger
        $empty  = (Get-Content -LiteralPath $BufferPath -Raw) -match 'SIN-TRABAJO'

        if ($recent -and $newer -and -not $empty) {
            Write-WatchLog "AFK ${idle}s con trabajo reciente -> generando memoria."
            Invoke-MemoryLog -OpencodeCmd $oc
        }
    }
    catch {
        Write-WatchLog "Error en loop: $($_.Exception.Message)"
    }
}
