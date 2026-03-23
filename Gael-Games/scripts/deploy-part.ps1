param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('frontend', 'backend', 'gateway', 'cloudflared', 'all')]
    [string]$Target
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

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

switch ($Target) {
    'frontend' {
        Invoke-Compose up -d --build --no-deps frontend
    }
    'backend' {
        Write-Host "Gael-Games has no backend service. Skipping target 'backend'."
    }
    'gateway' {
        Invoke-Compose up -d --build --no-deps gateway
    }
    'cloudflared' {
        $token = Get-EnvValue -Key 'CLOUDFLARED_TUNNEL_TOKEN'
        if ([string]::IsNullOrWhiteSpace($token)) {
            throw "CLOUDFLARED_TUNNEL_TOKEN is empty in .env. Cannot deploy cloudflared."
        }
        Invoke-Compose --profile cloudflare up -d --no-deps cloudflared
    }
    'all' {
        Invoke-Compose up -d --build frontend gateway
    }
}

Write-Host ''
Write-Host "Deploy finished for: $Target"
Invoke-Compose --profile cloudflare ps

