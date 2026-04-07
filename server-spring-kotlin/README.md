# server-spring-kotlin

Spring Boot + Kotlin backend implementation for `tester.com`, following `DEVELOPMENT_PLAN.md`.

> **Quick start?** See [QUICK_START.md](./QUICK_START.md) or run `./quick-start.ps1` for automated setup.

## Getting Started (5 minutes)

### 1. Prerequisites

Make sure you have:
- JDK 21+ installed (`java -version`)
- Gradle 9+ installed (`gradle --version`)
- PostgreSQL running (or Docker: `docker compose up -d`)

### 2. Navigate to backend folder

```powershell
cd server-spring-kotlin
```

### 3. Free port 3001 (if needed)

```powershell
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }
```

### 4. Set environment variables (copy & paste)

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

### 5. Start the backend

```powershell
gradle bootRun
```

### 6. Verify it's running

Open a new terminal and test:

```powershell
# Should return list of products
curl -X GET http://localhost:3001/api/products

# Should return 404 for non-existent user
curl -X GET http://localhost:3001/api/users/999
```

✅ Backend is now running on `http://localhost:3001`

## Runtime requirements

- JDK 21+ (23 recommended, tested with OpenJDK 21 LTS)
- Gradle 9+
- PostgreSQL (or Docker Compose stack from repository root)

## Environment variables

The following environment variables are required for running the application:

```powershell
$env:SERVER_PORT='3001'
$env:DATABASE_URL='jdbc:postgresql://localhost:5432/ecommerce?user=postgres&password=postgres'
$env:JWT_SECRET='1234567890123456'
$env:JWT_EXPIRES_IN='1h'
$env:JWT_ISSUER='tester.com'
$env:JWT_AUDIENCE='tester.com-web'
$env:BCRYPT_PEPPER='pepper'
$env:BCRYPT_SALT_ROUNDS='12'
$env:SEED_RESET_DB='false'
```

**Optional:** To automatically reset the database on startup, set `$env:SEED_RESET_DB='true'`

## Main modules implemented

- Security/JWT (`auth/`, `config/`)
- Products (`product/` — `/api/products`, `/api/products/{id}`)
- Users/Auth (`user/` — `/api/users/register`, `/api/users/login`, `/api/users`, `/api/users/{id}`, `/api/users/{id}/terminate`, `/api/users/me`, `/api/users/me/address`)
- Cart (`cart/` — `/api/cart`, `/api/cart/{id}`)
- Orders and Payments (`order/` — `/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/payments`, `/api/orders/{id}/payments/{paymentId}`)
- Boleto PDF (`order/` — `/api/orders/{id}/boleto/{reference}`)
- Database seeding (`seed/` — Automatic on `SEED_RESET_DB=true`)
- Global error handling (`common/` — Standardized API error responses)

## Build and run

### Available Gradle commands

From the `server-spring-kotlin` folder:

```powershell
# ✅ Compile classes (fast)
gradle classes

# ✅ Build JAR executable (creates build/libs/*.jar)
gradle bootJar

# ✅ Run the application locally (with auto-reload)
gradle bootRun

# ✅ Full build (compile + package, excludes tests)
gradle build

# 🧪 Run all unit/integration tests
gradle test

# 🧪 Run API tests only (tagged)
gradle apiTest

# 🗑️ Clean all build artifacts
gradle clean
```

### Using Spring Boot directly

If you prefer to run the compiled JAR:

```powershell
# 1. Build JAR
gradle bootJar

# 2. Run JAR
java -Dspring.profiles.active=development `
  -DSERVER_PORT=3001 `
  -DDATABASE_URL='jdbc:postgresql://localhost:5432/ecommerce?user=postgres&password=postgres' `
  -DJWT_SECRET='1234567890123456' `
  -jar build/libs/tester-api-kotlin-*.jar
```

### Quick start (recommended)

From this folder:

```powershell
# Step 1: Set environment variables
$env:SERVER_PORT='3001'
$env:DATABASE_URL='jdbc:postgresql://localhost:5432/ecommerce?user=postgres&password=postgres'
$env:JWT_SECRET='1234567890123456'
$env:JWT_EXPIRES_IN='1h'
$env:JWT_ISSUER='tester.com'
$env:JWT_AUDIENCE='tester.com-web'
$env:BCRYPT_PEPPER='pepper'
$env:BCRYPT_SALT_ROUNDS='12'
$env:SEED_RESET_DB='true'

# Step 2: Compile and run
gradle bootRun
```

### Troubleshooting

#### ❌ Error: "Port 3001 is already in use"

**Solution:**
```powershell
# Option 1: Kill the process using port 3001
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }

# Option 2: Use a different port
$env:SERVER_PORT='3002'
gradle bootRun
```

#### ❌ Error: "Database connection refused"

**Solution:**
```powershell
# Start Docker containers
docker compose up -d

# Verify PostgreSQL is running
docker compose ps

# Check connection
psql -h localhost -U postgres -c "SELECT 1"
```

#### ❌ Error: "No such table: users"

**Solution:** Make sure `SEED_RESET_DB=true` is set
```powershell
$env:SEED_RESET_DB='true'
gradle bootRun
```

#### ❌ Error: "JWT_SECRET is not set"

**Solution:** All JWT environment variables must be set in the same PowerShell session
```powershell
# Verify they're set
Write-Output @"
  SERVER_PORT: $($env:SERVER_PORT)
  JWT_SECRET: $($env:JWT_SECRET)
  DATABASE_URL: $($env:DATABASE_URL)
"@

# Re-set if needed
$env:JWT_SECRET='1234567890123456'
$env:JWT_ISSUER='tester.com'
$env:JWT_AUDIENCE='tester.com-web'
```

#### ❌ Error: "gradle: command not found" (on Linux/Mac)

**Solution:**
```bash
# Use the Gradle wrapper instead
./gradlew bootRun

# Or install Gradle globally
brew install gradle  # macOS
apt install gradle   # Ubuntu/Debian
```

#### ❌ Port 3001 is already in use (Alternative)

**Solution:**
```powershell
# Find and list all Java processes
Get-Process java

# Kill specific Java process by PID
Stop-Process -Id 1234 -Force
```

## Testing

### Unit and integration tests

Rest Assured Kotlin tests are present under `src/test/kotlin`. Tests require the backend runtime to be available and database to be seeded.

```powershell
# Run all tests (default)
gradle test

# Run specific external API tests (tagged)
gradle apiTest
```

### Contract testing with Pact

Pact contract tests validate compatibility with known consumers:

```powershell
gradle pactTest
```

### Running Playwright E2E tests

From the `web` folder, after the backend is running:

```powershell
cd ..\web
npx playwright test --project=api
```
