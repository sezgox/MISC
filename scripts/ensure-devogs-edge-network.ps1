$ErrorActionPreference = 'Stop'
cmd /c "docker network inspect devogs_edge >nul 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host 'Network devogs_edge already exists.'
} else {
    docker network create devogs_edge
    if ($LASTEXITCODE -ne 0) {
        throw 'docker network create devogs_edge failed'
    }
    Write-Host 'Created Docker network devogs_edge.'
}
