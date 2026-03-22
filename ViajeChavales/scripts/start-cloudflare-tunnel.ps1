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

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Missing required command: docker'
}

$tokenLine = Select-String -Path $envFile -Pattern '^CLOUDFLARED_TUNNEL_TOKEN=' | Select-Object -First 1
$tokenValue = if ($tokenLine) { ($tokenLine.Line -split '=', 2)[1].Trim() } else { '' }

if ([string]::IsNullOrWhiteSpace($tokenValue)) {
    throw "CLOUDFLARED_TUNNEL_TOKEN is empty in $envFile. Create a tunnel in Cloudflare and set the token first."
}

Write-Host 'Starting Cloudflare tunnel connector...'
Invoke-Compose --profile cloudflare up -d --no-deps cloudflared

Write-Host ''
Write-Host 'Tunnel connector status:'
Invoke-Compose --profile cloudflare ps cloudflared

if ($ShowLogs) {
    Write-Host ''
    Write-Host 'Recent logs:'
    Invoke-Compose --profile cloudflare logs --tail 40 cloudflared
} else {
    Write-Host ''
    Write-Host 'Tip: for logs run:'
    Write-Host "docker compose -f `"$appDir\docker-compose.yml`" --env-file `"$envFile`" --profile cloudflare logs -f cloudflared"
}
