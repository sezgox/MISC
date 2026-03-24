param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('frontend', 'backend', 'gateway', 'all')]
    [string]$Target
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$envFile = Join-Path $appDir '.env'
$composeFile = Join-Path $appDir 'docker-compose.yml'

function Invoke-Compose {
    param([Parameter(Mandatory = $true)][string[]]$ComposeArgs)
    & docker compose -f $composeFile --env-file $envFile @ComposeArgs
}

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

switch ($Target) {
    'frontend' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--build', '--no-deps', 'frontend')
    }
    'backend' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--build', '--no-deps', 'backend')
    }
    'gateway' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--build', '--no-deps', 'gateway')
    }
    'all' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--build')
    }
}

Write-Host ''
Write-Host "Deploy finished for: $Target"
Invoke-Compose -ComposeArgs @('ps')
