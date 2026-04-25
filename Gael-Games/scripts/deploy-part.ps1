# frontend = static Vite image; gateway = nginx in front of it.
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('frontend', 'gateway', 'all')]
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

function Invoke-ComposeWithRetry {
    param([Parameter(Mandatory = $true)][string[]]$ComposeArgs)

    $attempt = 1
    $maxAttempts = 3
    $delaySeconds = 20

    while ($true) {
        Invoke-Compose -ComposeArgs $ComposeArgs
        if ($LASTEXITCODE -eq 0) {
            return
        }

        if ($attempt -ge $maxAttempts) {
            exit $LASTEXITCODE
        }

        Write-Warning "docker compose failed with exit code $LASTEXITCODE; retrying in ${delaySeconds}s ($attempt/$maxAttempts)..."
        Start-Sleep -Seconds $delaySeconds
        $attempt++
        $delaySeconds *= 2
    }
}

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Run .\init-app.ps1 first."
}

switch ($Target) {
    'frontend' {
        Invoke-ComposeWithRetry -ComposeArgs @('up', '-d', '--build', '--no-deps', 'frontend')
    }
    'gateway' {
        Invoke-ComposeWithRetry -ComposeArgs @('up', '-d', '--build', '--no-deps', 'gateway')
    }
    'all' {
        Invoke-ComposeWithRetry -ComposeArgs @('up', '-d', '--build', 'frontend', 'gateway')
    }
}

Write-Host ''
Write-Host "Deploy finished for: $Target"
Invoke-Compose -ComposeArgs @('ps')
