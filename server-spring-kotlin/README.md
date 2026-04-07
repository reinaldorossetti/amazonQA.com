# server-spring-kotlin

Spring Boot + Kotlin backend implementation for `tester.com`, following `DEVELOPMENT_PLAN.md`.

## Runtime requirements

- JDK 23 (mandatory)
- Gradle 9+
- PostgreSQL (or Docker Compose stack from repository root)

## Environment

Use the existing `.env` values as reference for local runtime:

- `SERVER_PORT` (default `3001`)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `BCRYPT_PEPPER`
- `BCRYPT_SALT_ROUNDS` (default `12`, valid range `4..31`)

## Main modules implemented

- Security/JWT (`auth`, `config`)
- Products (`/api/products`, `/api/products/{id}`)
- Users/Auth (`/api/users/register`, `/api/users/login`, `/api/users`, `/api/users/{id}`, `/api/users/{id}/terminate`, `/api/users/me`, `/api/users/me/address`)
- Cart (`/api/cart`, `/api/cart/{id}`)
- Orders and Payments (`/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/payments`, `/api/orders/{id}/payments/{paymentId}`)
- Boleto PDF (`/api/orders/{id}/boleto/{reference}`)

## Build and run

From this folder:

- `gradle classes` (compile system)
- `gradle bootJar` (package application)
- `gradle bootRun` (run API locally)
- `gradle build` (default build, excludes external API tests)

## About tests

Rest Assured Kotlin tests are present under `src/test/kotlin` and should be executed after the backend runtime is available and seeded.

- `gradle apiTest` (runs tagged external API tests)
