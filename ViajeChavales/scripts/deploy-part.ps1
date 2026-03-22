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

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

switch ($Target) {
    'frontend' {
        Invoke-Compose up -d --build --no-deps frontend
    }
    'backend' {
        Invoke-Compose up -d --build --no-deps backend
    }
    'gateway' {
        Invoke-Compose up -d --build --no-deps gateway
    }
    'cloudflared' {
        Invoke-Compose --profile cloudflare up -d --no-deps cloudflared
    }
    'all' {
        Invoke-Compose up -d --build
    }
}

Write-Host ''
Write-Host "Deploy finished for: $Target"
Invoke-Compose --profile cloudflare ps
