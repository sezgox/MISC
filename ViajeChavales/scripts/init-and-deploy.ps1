param(
    [switch]$ShowLogs
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$envFile = Join-Path $appDir '.env'
$initScript = Join-Path $appDir 'init-app.ps1'
$tunnelScript = Join-Path $scriptDir 'start-cloudflare-tunnel.ps1'

Write-Host 'Step 1/2: starting app stack...'
powershell -ExecutionPolicy Bypass -File $initScript

Write-Host ''
Write-Host 'Step 2/2: starting Cloudflare tunnel...'
if ($ShowLogs) {
    powershell -ExecutionPolicy Bypass -File $tunnelScript -ShowLogs
} else {
    powershell -ExecutionPolicy Bypass -File $tunnelScript
}

if (Test-Path $envFile) {
    $hostnameLine = Select-String -Path $envFile -Pattern '^CLOUDFLARE_PUBLIC_HOSTNAME=' | Select-Object -First 1
    $hostname = if ($hostnameLine) { ($hostnameLine.Line -split '=', 2)[1].Trim() } else { '' }
    if (-not [string]::IsNullOrWhiteSpace($hostname)) {
        Write-Host ''
        Write-Host "Public URL: https://$hostname"
    }
}
