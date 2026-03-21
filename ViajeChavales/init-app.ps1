$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = $scriptDir
$envFile = Join-Path $appDir '.env'
$envExample = Join-Path $appDir '.env.example'
$defaultPort = if ($env:APP_PORT) { $env:APP_PORT } else { '8091' }

function Invoke-Compose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)

    docker compose -f (Join-Path $appDir 'docker-compose.yml') --env-file $envFile @Args
}

function Require-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command: $Name"
    }
}

function New-HexSecret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return -join ($bytes | ForEach-Object { $_.ToString('x2') })
}

function Write-EnvFile {
    $content = @"
APP_PORT=$defaultPort
POSTGRES_DB=viajechavales
POSTGRES_USER=viajechavales
POSTGRES_PASSWORD=$(New-HexSecret)
JWT_SECRET=$(New-HexSecret)
JWT_EXPIRES=7d
JWT_ISSUER=ViajeChavales
JWT_AUDIENCE=ViajeChavalesUsers
"@

    Set-Content -Path $envFile -Value $content -Encoding ascii
}

function Wait-ForHttp {
    param(
        [string]$Url,
        [int]$Attempts = 60
    )

    for ($index = 0; $index -lt $Attempts; $index += 1) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    return $false
}

function Test-BackendAuthFailure {
    $logs = Invoke-Compose logs backend --tail 120 2>$null
    return $logs -match 'P1000: Authentication failed'
}

function Reset-StackVolumes {
    Write-Host "Detected stale PostgreSQL credentials in the Docker volume."
    Write-Host "Recreating the ViajeChavales stack volumes..."
    Invoke-Compose down -v
    Invoke-Compose up -d --build
}

Require-Command docker

if (-not (Test-Path $envExample)) {
    throw "Missing env example at $envExample"
}

docker compose version | Out-Null

if (-not (Test-Path $envFile)) {
    Write-Host "Creating $envFile"
    Write-EnvFile
} else {
    Write-Host "Using existing $envFile"
}

Write-Host "Building and starting ViajeChavales..."
Invoke-Compose up -d --build

$appPortLine = Select-String -Path $envFile -Pattern '^APP_PORT=' | Select-Object -First 1
$appPort = if ($appPortLine) { ($appPortLine.Line -split '=', 2)[1] } else { $defaultPort }
$appUrl = "http://127.0.0.1:$appPort"
$apiUrl = "$appUrl/api/"

if ((-not (Wait-ForHttp -Url $appUrl)) -or (-not (Wait-ForHttp -Url $apiUrl))) {
    if (Test-BackendAuthFailure) {
        Reset-StackVolumes
        if ((-not (Wait-ForHttp -Url $appUrl)) -or (-not (Wait-ForHttp -Url $apiUrl))) {
            throw "App did not become fully reachable at $appUrl after recreating the stack volumes"
        }
    } else {
        Invoke-Compose ps
        throw "App did not become fully reachable at $appUrl"
    }
}

Write-Host ""
Write-Host "ViajeChavales is up."
Write-Host "URL: $appUrl"
Write-Host "API: $apiUrl"
Write-Host ""
Invoke-Compose ps
