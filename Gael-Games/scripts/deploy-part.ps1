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
        Write-Host "Gael-Games has no backend service. Skipping target 'backend'."
    }
    'gateway' {
        Invoke-Compose up -d --build --no-deps gateway
    }
    'cloudflared' {
        Write-Host "Shared tunnel mode: Gael-Games does not run a local cloudflared service."
        Write-Host "Use ViajeChavales/scripts/deploy-part.* cloudflared for connector updates."
    }
    'all' {
        Invoke-Compose up -d --build frontend gateway
    }
}

Write-Host ''
Write-Host "Deploy finished for: $Target"
Invoke-Compose ps
