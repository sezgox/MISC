$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tunnelDir = Join-Path $repoRoot 'infra\cloudflare-tunnel'
$viaEnv = Join-Path $repoRoot 'ViajeChavales\.env'
$tunnelOnlyEnv = Join-Path $tunnelDir '.env'
$composeFile = Join-Path $tunnelDir 'docker-compose.yml'

& (Join-Path $repoRoot 'scripts\ensure-devogs-edge-network.ps1')

function Test-HasTunnelToken {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $false }
    return [bool](Select-String -Path $Path -Pattern '^CLOUDFLARED_TUNNEL_TOKEN=.' -Quiet)
}

$envFile = $null
if (Test-HasTunnelToken -Path $tunnelOnlyEnv) {
    $envFile = $tunnelOnlyEnv
    Write-Host 'Using CLOUDFLARED_TUNNEL_TOKEN from infra/cloudflare-tunnel/.env'
} elseif (Test-HasTunnelToken -Path $viaEnv) {
    $envFile = $viaEnv
    Write-Host 'Using CLOUDFLARED_TUNNEL_TOKEN from ViajeChavales/.env (fallback; prefer infra/cloudflare-tunnel/.env)'
} else {
    throw 'Missing CLOUDFLARED_TUNNEL_TOKEN: copy infra/cloudflare-tunnel/.env.example to infra/cloudflare-tunnel/.env and set the token'
}

Write-Host 'Starting Cloudflare tunnel (pws-cloudflared) on network devogs_edge...'
& docker compose -f $composeFile --env-file $envFile @('up', '-d', '--force-recreate')

Write-Host ''
& docker compose -f $composeFile --env-file $envFile @('ps')
Write-Host ''
Write-Host 'Cloudflare routes must use http://devogs-ingress:80'
