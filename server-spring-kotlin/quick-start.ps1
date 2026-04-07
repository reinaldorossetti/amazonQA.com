#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick start script for server-spring-kotlin backend

.DESCRIPTION
    Automatically sets up environment, kills port 3001, and starts the backend

.EXAMPLE
    ./quick-start.ps1
    
.EXAMPLE
    ./quick-start.ps1 -seedDb
#>

param(
    [switch]$seedDb = $false,
    [string]$port = "3001",
    [string]$dbUser = "postgres",
    [string]$dbPassword = "postgres"
)

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    $color = @{
        "SUCCESS" = $Green
        "ERROR" = $Red
        "WARNING" = $Yellow
        "INFO" = $Reset
    }[$Status]
    Write-Host "$color[$Status]$Reset $Message"
}

# Step 1: Check requirements
Write-Status "Checking requirements..." "INFO"

$jdkVersion = java -version 2>&1 | Select-String -Pattern "(21|23|24|25)"
if (-not $jdkVersion) {
    Write-Status "JDK 21+ not found! Please install JDK 21 or higher" "ERROR"
    exit 1
}
$version = ($jdkVersion | Select-String -Pattern "\d+\.\d+\.\d+" -AllMatches).Matches[0].Value
Write-Status "✓ JDK $version found" "SUCCESS"

# Step 2: Kill port 3001
Write-Status "Freeing port $port..." "INFO"
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Status "✓ Killed process on port $port" "SUCCESS"
} else {
    Write-Status "✓ Port $port is free" "SUCCESS"
}

# Step 3: Navigate to folder
Write-Status "Navigating to backend folder..." "INFO"
$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $backendDir
Write-Status "✓ Working directory: $(Get-Location)" "SUCCESS"

# Step 4: Set environment variables
Write-Status "Setting environment variables..." "INFO"
$env:SERVER_PORT = $port
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/ecommerce?user=$dbUser&password=$dbPassword"
$env:JWT_SECRET = "1234567890123456"
$env:JWT_EXPIRES_IN = "1h"
$env:JWT_ISSUER = "tester.com"
$env:JWT_AUDIENCE = "tester.com-web"
$env:BCRYPT_PEPPER = "pepper"
$env:BCRYPT_SALT_ROUNDS = "12"
$env:SEED_RESET_DB = if ($seedDb) { "true" } else { "false" }

Write-Host @"
$Green✓ Environment variables set:
  - SERVER_PORT: $($env:SERVER_PORT)
  - DATABASE_URL: jdbc:postgresql://localhost:5432/ecommerce
  - SEED_RESET_DB: $($env:SEED_RESET_DB)$Reset
"@

# Step 5: Clean and build
Write-Status "Compiling application..." "INFO"
& gradle classes 2>&1 | Select-String -Pattern "(BUILD SUCCESS|BUILD FAILED)" | ForEach-Object {
    if ($_ -match "FAILED") {
        Write-Status "Build failed!" "ERROR"
        exit 1
    }
}
Write-Status "✓ Application compiled" "SUCCESS"

# Step 6: Run
Write-Status "Starting backend on port $port..." "INFO"
Write-Host ""
& gradle bootRun

# Cleanup
Pop-Location
