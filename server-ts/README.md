# server-ts

TypeScript backend project for `tester.com`, migrated from the JavaScript backend while preserving the same endpoint paths and feature behavior.

## Stack

- Next.js 16
- TypeScript (strict mode)
- PostgreSQL (`pg`)
- Vitest (API tests)

## Scripts

- `npm run dev` — starts API server on port `3001`
- `npm run build` — production build
- `npm run start` — runs production server on port `3001`
- `npm run typecheck` — strict TypeScript check (`tsc --noEmit`)
- `npm run lint` — ESLint with zero warnings
- `npm run test` — API tests
- `npm run seed` — initializes schema and seed data
- `npm run ensure-admin-user` — ensures admin account and roles

## Definition of Done (passed)

The following DoD checks are currently passing for this backend project:

- ✅ **Linting:** `npm run lint` passes with zero warnings.
- ✅ **Typing:** `npm run typecheck` passes in strict TypeScript mode (`tsc --noEmit`).
- ✅ **Testing:** `npm run test` passes (`42/42` tests)
- ✅ **Build:** `npm run build` completes successfully in production mode.
- ✅ **Language compliance:** source files in `app/`, `lib/`, `scripts/`, and `tests/` are aligned to English-only messaging.
- ✅ **Documentation:** this `README.md` is updated with quality status and traceability.

## Definition of Done (pending)

- ⏳ **Local E2E (frontend):** running `npm run test:e2e` in `web/` is now a DoD quality gate and must pass.
	- Latest local execution evidence: `51 passed`, `4 failed`, `5 flaky`, `1 did not run` (exit code `1`).

## 1. Requirements Traceability Matrix (RTM)
Validation command batch used:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `cd ../web && npm run test:e2e` (local Playwright Chromium suite)

## Requirements Traceability Matrix (RTM)

| Requirement ID | Description | Acceptance Criteria (QA) | Test Case / Evidence |
| --- | --- | --- | --- |
| REQ-BE-01 | Keep backend endpoint contract compatibility after TypeScript migration | Existing API route structure remains available in Next.js App Router build output | `npm run build` route tree includes all `/api/*` endpoints listed in this README |
| REQ-BE-02 | Enforce strict TypeScript in backend code | Project type check passes with strict config and no compile-time type errors | `npm run typecheck` (pass) |
| REQ-BE-03 | Keep code quality gate at zero lint warnings | ESLint run succeeds with max warnings set to zero | `npm run lint` (pass) |
| REQ-BE-04 | Preserve core API behavior across domain flows | API tests for products, users, orders, payments, and boleto download pass | `tests/api/*.test.ts` via `npm run test` (`42/42` pass) |
| REQ-BE-05 | Ensure production readiness for current backend package | Production build completes successfully on Next.js 16 | `npm run build` (pass) |
| REQ-QA-06 | Ensure local end-to-end frontend coverage as release gate | Playwright frontend Chromium suite must run locally via project script and pass | `cd web && npm run test:e2e` (executed; currently failing: `51 passed`, `4 failed`, `5 flaky`, `1 did not run`) |

## Environment

Create and adjust `.env` values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `BCRYPT_PEPPER`
- `SEED_ADMIN_EMAIL`

## Endpoint compatibility

The following route structure matches the existing backend contract:

- `/api/cart`
- `/api/cart/[id]`
- `/api/orders`
- `/api/orders/[id]`
- `/api/orders/[id]/boleto/[reference]`
- `/api/orders/[id]/payments`
- `/api/orders/[id]/payments/[paymentId]`
- `/api/products`
- `/api/products/[id]`
- `/api/users`
- `/api/users/[id]`
- `/api/users/[id]/terminate`
- `/api/users/login`
- `/api/users/me`
- `/api/users/me/address`
- `/api/users/register`
