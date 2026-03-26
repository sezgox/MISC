<#
.SYNOPSIS
  Red devogs_edge -> init-app de cada app con .env -> tunel Cloudflare (token en infra/cloudflare-tunnel/.env).
  Comprueba que pws-cloudflared quede en ejecucion.
#>
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

& (Join-Path $repoRoot 'scripts\ensure-devogs-edge-network.ps1')

$via = Join-Path $repoRoot 'ViajeChavales'
$gael = Join-Path $repoRoot 'Gael-Games'
$port = Join-Path $repoRoot 'Portfolio'

if (Test-Path (Join-Path $via '.env')) {
    Write-Host '=== ViajeChavales ===' -ForegroundColor Cyan
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $via 'init-app.ps1')
} else {
    Write-Host 'Omitido ViajeChavales: no hay ViajeChavales/.env' -ForegroundColor Yellow
}

if (Test-Path (Join-Path $gael '.env')) {
    Write-Host '=== Gael-Games ===' -ForegroundColor Cyan
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $gael 'init-app.ps1')
} else {
    Write-Host 'Omitido Gael-Games: no hay Gael-Games/.env' -ForegroundColor Yellow
}

if (Test-Path (Join-Path $port '.env')) {
    Write-Host '=== Portfolio ===' -ForegroundColor Cyan
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $port 'init-app.ps1')
} else {
    Write-Host 'Omitido Portfolio: no hay Portfolio/.env' -ForegroundColor Yellow
}

Write-Host '=== Shared ingress (devogs-ingress, landing + proxies) ===' -ForegroundColor Cyan
& (Join-Path $repoRoot 'scripts\ensure-devogs-edge-network.ps1')
$ingressCompose = Join-Path $repoRoot 'infra\ingress\docker-compose.yml'
$ingressEnv = Join-Path $repoRoot 'infra\ingress\.env'
if (Test-Path $ingressEnv) {
    & docker compose -f $ingressCompose --env-file $ingressEnv up -d --force-recreate
} else {
    & docker compose -f $ingressCompose up -d --force-recreate
}

$viaEnv = Join-Path $via '.env'
$tunnelOnly = Join-Path $repoRoot 'infra\cloudflare-tunnel\.env'
$hasToken = (Test-Path $tunnelOnly) -and (Select-String -Path $tunnelOnly -Pattern '^CLOUDFLARED_TUNNEL_TOKEN=.' -Quiet)
if (-not $hasToken -and (Test-Path $viaEnv)) {
    $hasToken = Select-String -Path $viaEnv -Pattern '^CLOUDFLARED_TUNNEL_TOKEN=.' -Quiet
}

if ($hasToken) {
    Write-Host '=== Cloudflare tunnel (pws-cloudflared) ===' -ForegroundColor Cyan
    & (Join-Path $repoRoot 'scripts\deploy-cloudflare-tunnel.ps1')
    $running = docker ps --filter 'name=pws-cloudflared' --filter 'status=running' --format '{{.Names}}' 2>$null
    if ([string]::IsNullOrWhiteSpace($running)) {
        throw 'El tunel no esta en ejecucion (pws-cloudflared). Revisa docker logs pws-cloudflared'
    }
    Write-Host "Tunnel OK: $running" -ForegroundColor Green
} else {
    Write-Host 'Omitido tunnel: sin CLOUDFLARED_TUNNEL_TOKEN en infra/cloudflare-tunnel/.env (ni fallback en ViajeChavales/.env)' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Listo. Rutas Cloudflare: http://devogs-ingress:80' -ForegroundColor Green
