# Apex Cloud Work — Helpers de sesión para opencode
# Colocar en profile de PowerShell o ejecutar manual al iniciar sesión

function Start-ChatHeartbeat {
    <#
    .SYNOPSIS
        Inicia heartbeat automático cada 10 min de silencio.
        Escribe en sesion-activa.md y cada 30 min vuelca a bitácora.
    #>
    $script = 'F:\apex-cloudworks\Memoria\chat-heartbeat.ps1'
    if (-not (Test-Path $script)) { Write-Error "No existe $script"; return }
    $job = Start-Job -FilePath $script
    Write-Host "✅ Heartbeat iniciado (Job ID: $($job.Id))"
    Write-Host "   Log: F:\apex-cloudworks\Memoria\chat-heartbeat.log"
    Write-Host "   Para detener: Stop-ChatHeartbeat"
    return $job
}

function Stop-ChatHeartbeat {
    <#
    .SYNOPSIS
        Detiene el job de heartbeat.
    #>
    $jobs = Get-Job | Where-Object { $_.Command -like '*chat-heartbeat*' }
    if ($jobs) {
        $jobs | Stop-Job | Remove-Job
        Write-Host "🛑 Heartbeat detenido ($($jobs.Count) job(s))"
    } else {
        Write-Host "ℹ️ No hay heartbeat corriendo"
    }
}

function Get-ChatHeartbeatStatus {
    <#
    .SYNOPSIS
        Muestra estado del heartbeat y últimas entradas.
    #>
    $log = 'F:\apex-cloudworks\Memoria\chat-heartbeat.log'
    $buffer = 'F:\apex-cloudworks\Memoria\sesion-activa.md'
    if (Test-Path $log) {
        Write-Host "=== Log heartbeat ==="
        Get-Content $log -Last 10 | ForEach-Object { Write-Host "  $_" }
    }
    if (Test-Path $buffer) {
        $hbs = [regex]::Matches((Get-Content $buffer -Raw), '(?m)^### 💓 Heartbeat')
        Write-Host "`n=== Buffer: $($hbs.Count) heartbeats ==="
        if ($hbs.Count -gt 0) {
            $last = $hbs[$hbs.Count - 1].Index
            $snippet = (Get-Content $buffer -Raw).Substring($last, [Math]::Min(300, (Get-Content $buffer -Raw).Length - $last))
            Write-Host "  Último:`n  $($snippet.Replace("`n", "`n  "))"
        }
    }
    $jobs = Get-Job | Where-Object { $_.Command -like '*chat-heartbeat*' }
    Write-Host "`n=== Jobs activos: $($jobs.Count) ==="
    $jobs | ForEach-Object { Write-Host "  ID $($_.Id)  State: $($_.JobStateInfo.State)" }
}

# Auto-cargar al iniciar sesión opencode (opcional)
# Descomenta la siguiente línea para auto-iniciar:
# Start-ChatHeartbeat | Out-Null