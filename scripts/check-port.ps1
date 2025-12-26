# PowerShell script to check and kill process using a specific port
# Usage: .\scripts\check-port.ps1 [port_number] [-Force]
# Example: .\scripts\check-port.ps1 5000
# Example: .\scripts\check-port.ps1 5000 -Force  (kills without prompting)

param(
    [Parameter(Position=0)]
    [int]$port = 5000,
    [switch]$Force
)

$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processes) {
    Write-Host "Found process(es) using port ${port}:" -ForegroundColor Yellow
    $processList = @()
    foreach ($proc in $processes) {
        $processId = $proc.OwningProcess
        $procInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($procInfo) {
            $processList += $processId
            Write-Host "  PID: $processId - $($procInfo.ProcessName) - $($procInfo.Path)" -ForegroundColor Cyan
        }
    }
    
    $shouldKill = $false
    if ($Force) {
        $shouldKill = $true
        Write-Host "`nForce flag set. Killing processes..." -ForegroundColor Yellow
    } else {
        # Try to use Read-Host, but handle non-interactive mode gracefully
        try {
            $kill = Read-Host "`nKill these processes? (y/N)"
            $shouldKill = ($kill -eq "y" -or $kill -eq "Y")
        } catch {
            Write-Host "`nNon-interactive mode detected. Use -Force flag to kill processes." -ForegroundColor Yellow
            Write-Host "Example: .\check-port.ps1 ${port} -Force" -ForegroundColor Cyan
            $shouldKill = $false
        }
    }
    
    if ($shouldKill) {
        foreach ($processId in $processList) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "Killed process $processId" -ForegroundColor Green
            } catch {
                Write-Host "Failed to kill process $processId : $_" -ForegroundColor Red
            }
        }
        Write-Host "Port ${port} is now free!" -ForegroundColor Green
    }
} else {
    Write-Host "Port ${port} is free!" -ForegroundColor Green
}


