param([switch]$Watchdog)

$BASE   = "F:\apex-cloudworks"
$WILSON = "$BASE\proyectos\wilson\jarvis.pyw"
$LOG    = "$BASE\wilson_boot.log"
$N8N_LOG = "$BASE\n8n_boot.log"

function log { param($m) $t = Get-Date -Format "yyyy-MM-dd HH:mm:ss"; "$t $m" | Out-File $LOG -Append; Write-Host "$t $m" }

function Start-N8N {
    $p = Get-Process | Where-Object { $_.ProcessName -eq "node" -and (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like "*n8n*" }
    if (-not $p) {
        log "n8n no corriendo. Arrancando..."
        try {
            $env:PATH = "E:\Programas;$env:PATH"
            $envRAW = Get-Content "$BASE\.env" | Where-Object { $_ -match '^N8N_API_KEY=' }
            $n8nKey = if ($envRAW) { $envRAW -replace '^N8N_API_KEY=' } else { '' }
            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = "E:\Programas\node.exe"
            $psi.Arguments = "E:\Programas\node_modules\npm\bin\npx-cli.js n8n start"
            $psi.WorkingDirectory = $BASE
            $psi.UseShellExecute = $false
            $psi.RedirectStandardOutput = $true
            $psi.RedirectStandardError = $true
            $psi.CreateNoWindow = $true
            $psi.EnvironmentVariables["N8N_API_KEY"] = $n8nKey
            $p = [System.Diagnostics.Process]::Start($psi)
            Start-Sleep -Seconds 8
            log "n8n lanzado PID $($p.Id) con N8N_API_KEY"
        } catch { log "ERROR n8n: $_" }
    } else { log "n8n ya corriendo PID $($p.Id)" }
}

function Start-Wilson {
    $p = Get-Process | Where-Object { $_.ProcessName -eq "python" -and (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like "*jarvis*" }
    if (-not $p) {
        log "Wilson no corriendo. Arrancando..."
        try {
            $p = Start-Process -WindowStyle Hidden -FilePath python -ArgumentList "`"$WILSON`"" -PassThru
            Start-Sleep -Seconds 5
            log "Wilson lanzado PID $($p.Id)"
        } catch { log "ERROR Wilson: $_" }
    } else { log "Wilson ya corriendo PID $($p.Id)" }
}

if ($Watchdog) {
    log "=== Watchdog iniciado ==="
    while ($true) {
        Start-N8N
        Start-Wilson
        Start-Sleep -Seconds 60
    }
} else {
    log "=== Arranque Wilson + n8n ==="
    Start-N8N
    Start-Wilson
    log "Hecho. Usá -Watchdog para mantenerlos vivos."
}
