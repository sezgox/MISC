$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = $scriptDir
$envFile = Join-Path $appDir '.env'
$envExample = Join-Path $appDir '.env.example'
$defaultPort = '8092'
$composeFile = Join-Path $appDir 'docker-compose.yml'

function Invoke-Compose {
    param([Parameter(Mandatory = $true)][string[]]$ComposeArgs)
    & docker compose -f $composeFile --env-file $envFile @ComposeArgs
}

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command: $Name"
    }
}

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

function Wait-ForHttp {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$Attempts = 40
    )

    for ($i = 0; $i -lt $Attempts; $i++) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            return $true
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    return $false
}

Require-Command docker
docker compose version | Out-Null

if (-not (Test-Path $envExample)) {
    throw "Missing env example at $envExample"
}

if (-not (Test-Path $envFile)) {
    Copy-Item -Path $envExample -Destination $envFile
    Write-Host "Created $envFile from .env.example"
} else {
    Write-Host "Using existing $envFile"
}

Write-Host "Building and starting Gael-Games (frontend + gateway)..."
Invoke-Compose -ComposeArgs @('up', '-d', '--build', 'frontend', 'gateway')

$appPort = Get-EnvValue -Key 'APP_PORT'
if ([string]::IsNullOrWhiteSpace($appPort)) {
    $appPort = $defaultPort
}

$appUrl = "http://127.0.0.1:$appPort"

if ((-not (Wait-ForHttp -Url $appUrl)) -or (-not (Wait-ForHttp -Url "$appUrl/healthz"))) {
    Invoke-Compose -ComposeArgs @('ps')
    throw "Gael-Games did not become reachable at $appUrl"
}

Write-Host ""
Write-Host "Gael-Games is up."
Write-Host "URL: $appUrl"
Write-Host "Health: $appUrl/healthz"
Write-Host ""
Invoke-Compose -ComposeArgs @('ps')

