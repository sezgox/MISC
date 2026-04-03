<#
.SYNOPSIS
  Baja stacks PWs, tunel compartido, ingress, stack hermano ../GameDevPortfolio si existe, limpia contenedores cloudflared (pws + nolo-portfolio) y la red devogs_edge. Opcional -RemoveImages.
#>
param(
    [switch]$RemoveImages
)

$ErrorActionPreference = 'Continue'
$repoRoot = Split-Path -Parent $PSScriptRoot

$tunnelCompose = Join-Path $repoRoot 'infra\cloudflare-tunnel\docker-compose.yml'
$viaEnv = Join-Path $repoRoot 'ViajeChavales\.env'
$tunnelEnv = Join-Path $repoRoot 'infra\cloudflare-tunnel\.env'

function Down-Compose {
    param([string]$ComposeFile, [string]$EnvFile, [switch]$Rmi)
    if (-not (Test-Path $ComposeFile) -or -not (Test-Path $EnvFile)) { return }
    $args = @('-f', $ComposeFile, '--env-file', $EnvFile, 'down', '--remove-orphans')
    if ($Rmi) { $args += '--rmi', 'local' }
    & docker compose @args
}

Write-Host 'Stopping tunnel stack...' -ForegroundColor Cyan
if (Test-Path $tunnelEnv) {
    Down-Compose -ComposeFile $tunnelCompose -EnvFile $tunnelEnv -Rmi:$RemoveImages
} elseif (Test-Path $viaEnv) {
    Down-Compose -ComposeFile $tunnelCompose -EnvFile $viaEnv -Rmi:$RemoveImages
}
docker rm -f pws-cloudflared 2>$null | Out-Null

$ingressCompose = Join-Path $repoRoot 'infra\ingress\docker-compose.yml'
$ingressEnv = Join-Path $repoRoot 'infra\ingress\.env'
if (Test-Path $ingressCompose) {
    Write-Host 'Down infra/ingress...' -ForegroundColor Cyan
    $downArgs = @('-f', $ingressCompose, 'down', '--remove-orphans')
    if (Test-Path $ingressEnv) {
        $downArgs = @('-f', $ingressCompose, '--env-file', $ingressEnv, 'down', '--remove-orphans')
    }
    if ($RemoveImages) { $downArgs += '--rmi', 'local' }
    & docker compose @downArgs
}

$stacks = @(
    @{ Name = 'Portfolio'; Dir = 'Portfolio' },
    @{ Name = 'Gael-Games'; Dir = 'Gael-Games' },
    @{ Name = 'ViajeChavales'; Dir = 'ViajeChavales' }
)

foreach ($s in $stacks) {
    $dir = Join-Path $repoRoot $s.Dir
    $cf = Join-Path $dir 'docker-compose.yml'
    $ef = Join-Path $dir '.env'
    if (-not (Test-Path $cf)) { continue }
    if (-not (Test-Path $ef)) {
        Write-Host "Skip $($s.Name): no .env" -ForegroundColor Yellow
        continue
    }
    Write-Host "Down $($s.Name)..." -ForegroundColor Cyan
    $args = @('-f', $cf, '--env-file', $ef, 'down', '--remove-orphans')
    if ($RemoveImages) { $args += '--rmi', 'local' }
    & docker compose @args
}

$parent = Split-Path -Parent $repoRoot
$gdevCf = Join-Path $parent 'GameDevPortfolio\docker-compose.yml'
$gdevEf = Join-Path $parent 'GameDevPortfolio\.env'
if (Test-Path $gdevCf) {
    Write-Host 'Down sibling GameDevPortfolio (..\GameDevPortfolio)...' -ForegroundColor Cyan
    if (Test-Path $gdevEf) {
        $gargs = @('-f', $gdevCf, '--env-file', $gdevEf, 'down', '--remove-orphans')
        if ($RemoveImages) { $gargs += '--rmi', 'local' }
        & docker compose @gargs
    }
    else {
        $gargs = @('-f', $gdevCf, 'down', '--remove-orphans')
        if ($RemoveImages) { $gargs += '--rmi', 'local' }
        & docker compose @gargs
    }
}

docker rm -f pws-cloudflared nolo-portfolio-cloudflared 2>$null | Out-Null
docker ps -aq --filter 'name=cloudflared' | ForEach-Object { docker rm -f $_ 2>$null | Out-Null }

docker network rm devogs_edge 2>$null | Out-Null
Write-Host 'Teardown finished.' -ForegroundColor Green
