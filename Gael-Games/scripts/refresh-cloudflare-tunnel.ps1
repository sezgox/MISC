param(
    [switch]$ShowLogs
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$envFile = Join-Path $appDir '.env'

function Invoke-Compose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    docker compose -f (Join-Path $appDir 'docker-compose.yml') --env-file $envFile @Args
}

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

Write-Host "Refreshing Cloudflare tunnel connector..."
try {
    Invoke-Compose --profile cloudflare rm -sf cloudflared
} catch {
    Write-Host "cloudflared container was not running; continuing."
}

Invoke-Compose --profile cloudflare up -d --no-deps cloudflared
Invoke-Compose --profile cloudflare ps

if ($ShowLogs) {
    Invoke-Compose --profile cloudflare logs -f cloudflared
}

