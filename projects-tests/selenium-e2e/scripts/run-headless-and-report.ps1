# Run headless E2E tests, capture Maven console log, and generate HEADLESS-RUN-REPORT.md
param(
    [string]$ModuleRoot = (Split-Path $PSScriptRoot -Parent)
)

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logsDir = Join-Path $ModuleRoot "logs"
$mavenLog = Join-Path $logsDir "maven-console-$stamp.log"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

Push-Location $ModuleRoot
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
    mvn test "-Dheadless=true" 2>&1 | Tee-Object -FilePath $mavenLog
    $exitCode = $LASTEXITCODE
} finally {
    $sw.Stop()
    Pop-Location
}

python (Join-Path $ModuleRoot "scripts\generate-headless-report.py") `
    --wall-clock-ms $sw.ElapsedMilliseconds `
    --maven-log $mavenLog

exit $exitCode
