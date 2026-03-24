param(
    [int]$Port = 9222,
    [switch]$KillExistingChrome,
    [switch]$UseDefaultProfile,
    [string]$ProfileDirectory = 'Default'
)

$ErrorActionPreference = 'Stop'

function Get-ChromePath {
    $candidates = @(
        'C:\Program Files\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
    )

    return $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

function Wait-ForCdp {
    param(
        [string]$Url,
        [int]$Attempts = 20
    )

    for ($index = 0; $index -lt $Attempts; $index += 1) {
        Start-Sleep -Seconds 1

        try {
            return Invoke-RestMethod -Uri $Url
        } catch {
        }
    }

    throw "Chrome started, but the CDP endpoint did not respond at $Url"
}

$chromePath = Get-ChromePath
if (-not $chromePath) {
    throw 'Google Chrome was not found on this system.'
}

if ($KillExistingChrome) {
    Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

$arguments = @("--remote-debugging-port=$Port")

if ($UseDefaultProfile) {
    $userDataDir = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
    $arguments += "--user-data-dir=$userDataDir"
    $arguments += "--profile-directory=$ProfileDirectory"
} else {
    $userDataDir = Join-Path $env:TEMP 'chrome-cdp-profile'
    $arguments += "--user-data-dir=$userDataDir"
}

$arguments += '--new-window'
$arguments += 'about:blank'

Write-Host "Launching Chrome with CDP on port $Port..."
Write-Host "Path: $chromePath"
Write-Host "Profile: $userDataDir"

if ($UseDefaultProfile -and -not $KillExistingChrome) {
    Write-Warning 'If Chrome is already open with that profile, CDP may fail to start. Use -KillExistingChrome if needed.'
}

Start-Process -FilePath $chromePath -ArgumentList $arguments | Out-Null

$versionUrl = "http://127.0.0.1:$Port/json/version"
$versionInfo = Wait-ForCdp -Url $versionUrl

Write-Host ''
Write-Host 'Chrome with CDP is ready.'
Write-Host "Version endpoint: $versionUrl"
Write-Host "webSocketDebuggerUrl: $($versionInfo.webSocketDebuggerUrl)"
Write-Host ''
Write-Host 'Recommended usage:'
Write-Host "  Isolated profile: .\open-chrome-cdp.ps1"
Write-Host "  Real profile:     .\open-chrome-cdp.ps1 -UseDefaultProfile -KillExistingChrome"
