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
    Write-Host "Shared tunnel mode active. Local cloudflared refresh skipped for Gael-Games."
    Write-Host "Refresh the shared connector from ViajeChavales if route changes are needed."
    exit 0
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
