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

function Get-EnvValue {
    param([string]$Key)
    $line = Select-String -Path $envFile -Pattern "^$Key=" | Select-Object -First 1
    if (-not $line) {
        return $null
    }

    return ($line.Line -split '=', 2)[1]
}

function Test-LocalCloudflaredEnabled {
    $raw = Get-EnvValue -Key 'CLOUDFLARED_RUN_LOCAL'
    return ($raw -and $raw.Trim().ToLowerInvariant() -eq 'true')
}

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

if (-not (Test-LocalCloudflaredEnabled)) {
    Write-Host "Shared tunnel mode active. Local cloudflared is disabled for Gael-Games."
    Write-Host "No action required here; connector runs under ViajeChavales."
    exit 0
}

$token = Get-EnvValue -Key 'CLOUDFLARED_TUNNEL_TOKEN'
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "CLOUDFLARED_TUNNEL_TOKEN is empty in .env. Cannot start local cloudflared."
}

Write-Host "Starting Cloudflare tunnel connector..."
Invoke-Compose --profile cloudflare up -d --no-deps cloudflared
Invoke-Compose --profile cloudflare ps

if ($ShowLogs) {
    Invoke-Compose --profile cloudflare logs -f cloudflared
}
