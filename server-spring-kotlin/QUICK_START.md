# Quick Start Guide - server-spring-kotlin

Complete step-by-step guide to get the backend running locally.

## Prerequisites

✓ JDK 23 installed  
✓ Gradle 9+ installed  
✓ PostgreSQL running (or Docker Compose started from repository root)

## Step 1: Start PostgreSQL (if not running)

From the repository root:

```powershell
docker compose up -d
```

Verify connection:

```powershell
psql -h localhost -U postgres -d ecommerce -c "SELECT VERSION();"
# Should output: PostgreSQL 16.x
```

## Step 2: Navigate to the backend folder

```powershell
cd d:\github-projects\tester.com\server-spring-kotlin
```

## Step 3: Kill any existing process on port 3001

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
```

## Step 4: Set environment variables (copy & paste all at once)

```powershell
$env:SERVER_PORT='3001'
$env:DATABASE_URL='jdbc:postgresql://localhost:5432/ecommerce?user=postgres&password=postgres'
$env:JWT_SECRET='1234567890123456'
$env:JWT_EXPIRES_IN='1h'
$env:JWT_ISSUER='tester.com'
$env:JWT_AUDIENCE='tester.com-web'
$env:BCRYPT_PEPPER='pepper'
$env:BCRYPT_SALT_ROUNDS='12'
$env:SEED_RESET_DB='true'
```

## Step 5: Run the application

```powershell
gradle bootRun
```

### Expected output:

```
✅ Tomcat started on port 3001 (http) with context path '/'
✅ Started TesterApiApplicationKt in X.XXX seconds
🗑️ Limpando banco de dados (TRUNCATE CASCADE)...
✓ Todas as tabelas limpas.
🌱 Inserindo N produtos...
✓ Produtos inseridos.
```

## Step 6: Test the API

In a **new terminal**:

```powershell
# Test a simple endpoint
curl -X GET http://localhost:3001/api/products
```

## Complete (one-liner for faster setup)

If you want to run everything in one command:

```powershell
cd d:\github-projects\tester.com\server-spring-kotlin; Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; '$env:SERVER_PORT="3001"; $env:DATABASE_URL="jdbc:postgresql://localhost:5432/ecommerce?user=postgres&password=postgres"; $env:JWT_SECRET="1234567890123456"; $env:JWT_EXPIRES_IN="1h"; $env:JWT_ISSUER="tester.com"; $env:JWT_AUDIENCE="tester.com-web"; $env:BCRYPT_PEPPER="pepper"; $env:BCRYPT_SALT_ROUNDS="12"; $env:SEED_RESET_DB="true"; gradle bootRun' | powershell
```

## Common Issues

### ❌ "Port 3001 is already in use"

```powershell
# Kill the process
Stop-Process -Name java -Force
# Or
Get-NetTCPConnection -LocalPort 3001 -State Listen | Stop-Process -Force
```

### ❌ "Database connection refused"

```powershell
# Start Docker containers
docker compose up -d

# Verify PostgreSQL
docker compose ps
```

### ❌ "No such table: users"

```powershell
# The seeding script will auto-run if you set SEED_RESET_DB=true
# Or manually trigger via API (admin endpoint)
```

### ❌ "JWT_SECRET is not set"

```powershell
# All environment variables MUST be set in the same PowerShell session
# Check if they're set:
Write-Output $env:JWT_SECRET

# Re-set all variables if needed
```

## Running Tests

After the backend is running, in a **new terminal**:

```powershell
cd d:\github-projects\tester.com\server-spring-kotlin

# Run all tests
gradle test

# Run API tests only
gradle apiTest
```

## Running E2E Tests (Playwright)

After the backend is running, in a **new terminal**:

```powershell
cd d:\github-projects\tester.com\web

# Run E2E tests (all browsers)
npx playwright test

# Run API contract tests only
npx playwright test --project=api
```

## Next Steps

1. ✓ Backend is running on `http://localhost:3001`
2. Run frontend: `cd ../server-ts && npm run dev`
3. Run E2E tests: `cd ../web && npx playwright test`
4. View API docs: `http://localhost:3001/swagger-ui.html`

## Support

For detailed docs, see:
- [README.md](./README.md) — Full documentation
- [../../DEVELOPMENT_PLAN.md](../../DEVELOPMENT_PLAN.md) — Architecture decisions
- [../../planning/](../../planning/) — Planning documents
