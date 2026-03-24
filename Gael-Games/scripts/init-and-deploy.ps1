$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$repoRoot = Split-Path -Parent $appDir
$envFile = Join-Path $appDir '.env'
$tunnelScript = Join-Path $repoRoot 'scripts\deploy-cloudflare-tunnel.ps1'

function Get-EnvValue {
    param([string]$Key)

    if (-not (Test-Path $envFile)) {
        return $null
    }

    $line = Select-String -Path $envFile -Pattern "^$Key=" | Select-Object -First 1
    if (-not $line) {
        return $null
    }

    return ($line.Line -split '=', 2)[1]
}

Push-Location $appDir
try {
    & .\init-app.ps1

    if (-not (Test-Path $envFile)) {
        throw "Missing $envFile after init-app."
    }

    Write-Host ''
    Write-Host 'Cloudflare tunnel (repo root)...'
    & $tunnelScript

    $publicHostname = Get-EnvValue -Key 'CLOUDFLARE_PUBLIC_HOSTNAME'
    if (-not [string]::IsNullOrWhiteSpace($publicHostname)) {
        Write-Host "Public URL: https://$publicHostname"
    }
} finally {
    Pop-Location
}
