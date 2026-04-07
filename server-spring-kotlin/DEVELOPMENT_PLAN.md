# Backend Kotlin + Spring Boot — Master Development Plan

Scope: Build a full backend in `server-spring-kotlin` using `server-ts` as behavioral reference, `docs/swagger/openapi.yaml` as API contract, and `planning/context.MD` as development rulebook.

---

## 1) Goal and non-negotiables

### Main goal
Deliver a Kotlin/Spring Boot backend with full parity for all mapped routes:

- `/api/products`
- `/api/products/{id}`
- `/api/users/register`
- `/api/users/login`
- `/api/users`
- `/api/users/{id}`
- `/api/users/{id}/terminate`
- `/api/users/me`
- `/api/users/me/address`
- `/api/cart`
- `/api/cart/{id}`
- `/api/orders`
- `/api/orders/{id}`
- `/api/orders/{id}/payments`
- `/api/orders/{id}/payments/{paymentId}`
- `/api/orders/{id}/boleto/{reference}`

### Mandatory standards (from `planning/context.MD`)
- English-only codebase (symbols, comments, logs, test names).
- Clean architecture and explicit contracts before business logic.
- Consistent error handling.
- Strong test traceability with RTM.
- Documentation updated together with implementation.
- Tests for normal and negative cases with comprehensive coverage, unit tests with JUnit 5.
---

## 2) Technical stack and architecture

## Runtime choices
- Kotlin: `2.0.x`
- Java: `23` (mandatory)
- Spring Boot: `3.4.x`
- Build: Gradle Kotlin DSL
- Data access: Spring Data JDBC or JPA (recommendation: JPA + native queries where parity requires it)
- DB: PostgreSQL
- Migration: Flyway
- Validation: Jakarta Validation
- Security: Spring Security + custom JWT filter (HS256)
- Tests: JUnit 5 + MockMvc + Testcontainers + RestAssured (optional)

## Build requirements
- Use Gradle Java Toolchain with `languageVersion = JavaLanguageVersion.of(23)`.
- CI pipeline must run with JDK 23 to guarantee environment parity.

## Proposed package layout

`com.tester.api`
- `config` (security, jackson, cors, exception, openapi)
- `common`
  - `exception`
  - `response` (error contract, pagination responses)
  - `util`
- `auth`
  - `jwt` (token signer/verifier)
  - `principal`
  - `filter`
- `product`
  - `controller`, `service`, `repository`, `model`, `dto`
- `user`
  - `controller`, `service`, `repository`, `model`, `dto`
- `cart`
  - `controller`, `service`, `repository`, `model`, `dto`
- `order`
  - `controller`, `service`, `repository`, `model`, `dto`
- `payment`
  - `controller`, `service`, `repository`, `model`, `dto`
- `seed` (admin/user bootstrap command or runner)

## API compatibility constraints
- Keep `snake_case` JSON names where contract already uses snake_case.
- Keep HTTP status behavior equivalent to `server-ts` + `openapi.yaml`.
- Keep route paths exactly as defined.
- Keep `Authorization: Bearer <token>` semantics.

---

## 3) Data model and migrations

## Flyway migration strategy
- `V1__baseline_schema.sql`:
  - `products`
  - `users`
  - `user_roles`
  - `cart_items`
  - `orders`
  - `order_items`
  - `payments`
  - constraints/indexes (including idempotency unique index by `(user_id, idempotency_key)`)
- `V2__seed_base_data.sql` (optional) OR seed runner (`ApplicationRunner`) for products/admin users.

## PostgreSQL notes to preserve behavior
- Monetary columns as `NUMERIC(10,2)`.
- Keep `ON DELETE` semantics equivalent to TS schema.
- Keep uniqueness rules for email/cpf/cnpj and `(user_id, product_id)` in cart.

---

## 4) Security and authorization model

## JWT behavior to match
- HS256 token signing.
- Claims: `sub`, `email`, `personType`, `iss`, `aud`, `iat`, `exp`.
- Environment-driven `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRES_IN`.

## Access rules
- Public:
  - `GET /api/products`
  - `GET /api/products/{id}`
  - `POST /api/users/register`
  - `POST /api/users/login`
  - `GET /api/orders/{id}/boleto/{reference}` (keep current contract behavior)
- Authenticated user:
  - cart routes
  - `/api/users/me`, `/api/users/me/address`
  - orders routes (owner scope)
- Admin-only:
  - `POST /api/products`, `PUT/DELETE /api/products/{id}`
  - `GET/POST /api/users`
  - `DELETE /api/users/{id}`
- Owner-or-admin:
  - `GET/PUT /api/users/{id}`
  - `POST /api/users/{id}/terminate`
  - `GET/PUT/DELETE /api/orders/{id}`
  - `POST /api/orders/{id}/payments`
  - `GET /api/orders/{id}/payments/{paymentId}`

---

## 5) Route-by-route implementation plan

## Products
1. `GET /api/products`
   - Optional `category` filter.
   - Ordered by name ASC.
2. `POST /api/products` (admin)
   - Validate `name` and `price`.
3. `GET /api/products/{id}`
   - 400 invalid id, 404 not found.
4. `PUT /api/products/{id}` (admin)
5. `DELETE /api/products/{id}` (admin)
   - Map FK violation to `409` when linked to orders.

## Users
6. `POST /api/users/register`
   - Validate required fields.
   - Enforce unique email/cpf/cnpj.
   - Hash password with BCrypt + pepper.
   - Add default role `user`.
7. `POST /api/users/login`
   - Validate credentials.
   - Reject inactive/closed users with `403`.
   - Return token + safe user payload + roles.
8. `GET /api/users` (admin)
   - Pagination + `status=all|active|closed`.
9. `POST /api/users` (admin)
   - Create user with role support (`user`/`admin`).
10. `GET /api/users/{id}` (owner/admin)
11. `PUT /api/users/{id}` (owner/admin)
   - Partial update.
   - Uniqueness checks on email/cpf/cnpj.
12. `DELETE /api/users/{id}` (admin)
   - Hard delete with proper responses.
13. `POST /api/users/{id}/terminate` (owner/admin)
   - Obfuscate personal data.
   - Set inactive and closed timestamp.
14. `GET /api/users/me`
15. `PUT /api/users/me/address`
   - Update only allowed address fields.

## Cart
16. `GET /api/cart`
   - Enforce owner scope (`userId` query only if equals auth user).
17. `POST /api/cart`
   - Batch add/increment.
   - Validate duplicate payload items.
   - Validate quantity bounds.
18. `DELETE /api/cart`
   - Remove by `cartItemId` with owner check.
19. `GET /api/cart/{id}`
   - Fetch only authenticated user item.

## Orders
20. `GET /api/orders`
   - Pagination, optional status.
   - Admin may filter by `userId`.
21. `POST /api/orders`
   - Support idempotency key.
   - Build order from cart.
   - Fallback items from request when cart empty.
   - Transaction: insert order + items + clear cart.
22. `GET /api/orders/{id}` (owner/admin)
23. `PUT /api/orders/{id}` (owner/admin)
   - Enforce transition graph:
     - created -> pending_payment|paid|cancelled
     - pending_payment -> paid|cancelled
     - paid -> processing|cancelled
     - processing -> shipped|cancelled
     - shipped -> delivered
24. `DELETE /api/orders/{id}`
   - Logical cancel (no hard delete).

## Payments
25. `POST /api/orders/{id}/payments`
   - Methods: `credit|debit|pix|boleto`.
   - Validate amount <= remaining balance.
   - Generate metadata:
     - Pix: code + QR payload.
     - Boleto: line + barcode + due date.
   - Update order status based on payment outcome.
26. `GET /api/orders/{id}/payments/{paymentId}`
   - Owner/admin access.
27. `GET /api/orders/{id}/boleto/{reference}`
   - Return generated PDF (`application/pdf`).

---

## 6) Requirements Traceability Matrix (RTM)

| Requirement ID | Description | Acceptance Criteria (QA) | Unit/Integration Test |
|---|---|---|---|
| REQ-API-01 | Endpoint parity with OpenAPI | All 16 route groups respond in expected status and payload shape | Controller integration tests by route |
| REQ-AUTH-01 | JWT authentication works for protected routes | 401 for missing/invalid token, 200 for valid token | Security filter tests + route tests |
| REQ-AUTHZ-01 | Role/ownership authorization | 403 when role/ownership rule is violated | Authorization integration tests |
| REQ-ORD-01 | Order creation transaction | Order + items created atomically, cart cleared | Transactional service tests |
| REQ-ORD-02 | Idempotent order creation | Repeated Idempotency-Key returns same order with 200 | Orders integration test |
| REQ-PAY-01 | Payment method validation | Invalid method => 400 | Payments controller test |
| REQ-PAY-02 | Partial/full payment logic | Cannot exceed remaining balance | Payments service test |
| REQ-USER-01 | Account termination obfuscation | Sensitive fields obfuscated, account deactivated | Users service test |
| SEC-01 | Password safety | BCrypt+pepper storage and login verification | Auth service tests |
| SEC-02 | SQL safety | Parameterized queries / repository safe access | Repository tests + code review |
| DOD-EN-01 | English-only codebase | No Portuguese in code/tests/comments | lint/grep quality gate |

---

## 7) Testing strategy

## Test pyramid
- Unit tests (services, validators, utilities).
- Integration tests (controller + security + DB via Testcontainers).
- Contract checks against OpenAPI examples.

## Minimum mandatory suites
- `ProductsControllerIT`
- `UsersControllerIT`
- `UsersMeControllerIT`
- `CartControllerIT`
- `OrdersControllerIT`
- `PaymentsControllerIT`
- `BoletoControllerIT`

## Quality gates
- Build passes.
- Lint/static checks pass.
- Tests pass locally and in CI.
- OpenAPI contract assertions pass.

---

## 8) Delivery plan (phases)

## Phase A — Bootstrap (Day 1)
- Create Spring Boot project skeleton in `server-spring-kotlin`.
- Configure Gradle, profiles, Flyway, test infra.
- Implement base exception/error response format.

## Phase B — Foundation (Day 2-3)
- Implement DB schema migrations + seed strategy.
- Implement JWT auth filter and role resolver.
- Implement shared pagination and validation utilities.

## Phase C — Products + Users (Day 4-6)
- Deliver all products endpoints.
- Deliver register/login + admin users + users by id + terminate + me + me/address.
- Deliver corresponding tests.

## Phase D — Cart + Orders + Payments (Day 7-10)
- Deliver cart endpoints.
- Deliver orders (including idempotency and transitions).
- Deliver payments + boleto PDF.
- Deliver integration coverage.

## Phase E — Hardening + Docs (Day 11-12)
- Error contract consistency review.
- Performance sanity checks on list endpoints.
- README + runbook + endpoint parity table update.

---

## 9) Definition of Done (DoD)

A feature group is done when:
- OpenAPI route behavior is implemented and tested.
- Authorization rules match reference behavior.
- Error cases map to expected status codes.
- Code is English-only.
- Tests for normal + negative cases are in place.
- Documentation updated.

---

## 10) Execution checklist

- [x] Create Spring Boot project structure under `server-spring-kotlin`
- [x] Add Gradle dependencies and plugins
- [x] Add Flyway migrations for full schema
- [x] Implement JWT and security filter
- [x] Implement products endpoints
- [x] Implement users endpoints
- [x] Implement users/me endpoints
- [x] Implement cart endpoints
- [x] Implement orders endpoints
- [x] Implement payments endpoints
- [x] Implement boleto PDF endpoint
- [ ] Build comprehensive automated test suite
- [ ] Validate endpoint parity against `openapi.yaml`
- [ ] Final QA pass + docs update

---

Prepared from:
- `planning/context.MD`
- `docs/swagger/openapi.yaml`
- `server-ts/README.md`
- `server-ts/app/api/**`
- `server-ts/tests/api/**`
