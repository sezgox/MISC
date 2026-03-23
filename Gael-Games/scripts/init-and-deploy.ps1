$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$envFile = Join-Path $appDir '.env'

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

    $token = Get-EnvValue -Key 'CLOUDFLARED_TUNNEL_TOKEN'
    if (-not [string]::IsNullOrWhiteSpace($token)) {
        & .\scripts\start-cloudflare-tunnel.ps1
    } else {
        Write-Host "CLOUDFLARED_TUNNEL_TOKEN is empty. Tunnel start skipped."
    }

    $publicHostname = Get-EnvValue -Key 'CLOUDFLARE_PUBLIC_HOSTNAME'
    if (-not [string]::IsNullOrWhiteSpace($publicHostname)) {
        Write-Host "Public URL: https://$publicHostname"
    }
} finally {
    Pop-Location
}

