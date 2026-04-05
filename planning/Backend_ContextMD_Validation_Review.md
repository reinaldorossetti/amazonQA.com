# Backend Validation & Code Review — Context.MD Rules

Date: 2026-04-05  
Scope: `server/**` (API routes, libs, scripts, API tests)

## 1) Executed validation baseline

### Automated checks

- Lint (Next lint compatibility mode): **PASS**
- Build (`next build`): **PASS**
- API tests (Vitest): **PASS**
  - Test files: 6
  - Tests: 42/42 passed

### Important environment/tooling notes

- Direct ESLint v9 CLI (`eslint .`) failed because project still uses legacy `.eslintrc` format.
- `next lint` currently works, but is deprecated in Next 15 and removed in Next 16.
- First Vitest attempt executed from wrong workspace root; fixed by forcing backend root.

---

## 2) RTM (Requirements Traceability Matrix)

| Requirement ID | Rule from `context.MD` | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| ARCH-01 | Data flow clarity and processing consistency | Partial | `server/app/api/orders/route.js`, `server/app/api/cart/route.js` | Good transaction usage, but contract consistency gaps still exist. |
| ARCH-02 | Contracts before logic (interfaces/types) | Fail | `server/**/*.js`; `server/**/*.ts` = none | Backend is JavaScript-only; strict TS contract requirement unmet. |
| ERR-01 | Standardized error handling | Partial | `server/app/api/cart/[id]/route.js` line 34 | Mixed response keys (`message` vs `error`) and inconsistent payload patterns. |
| SEC-01 | AuthZ/AuthN for sensitive operations | **Fail (Critical)** | `server/app/api/orders/[id]/boleto/[reference]/route.js` | Route returns boleto PDF without explicit auth/authz checks. |
| SEC-02 | PII protection / least privilege | Partial | `server/app/api/users/login/route.js`, `server/app/api/users/me/route.js` | Some masking exists in terminate flow, but broad PII exposure remains in responses. |
| ENG-01 | English-only codebase | Fail | Multiple Portuguese messages in runtime/test files (e.g. `server/lib/auth.js` line 51, 98, 103) | Violates explicit language standard. |
| DOD-01 | ESLint with zero warnings/errors | Pass* | `next lint` output: no warnings/errors | *Depends on deprecated lint path; migration needed. |
| DOD-02 | Strict TypeScript (no any) | Fail | No `.ts` source in backend runtime | Requirement not met. |
| DOD-03 | Testing coverage aligned to RTM | Partial | 42 passing tests in `server/tests/api/**` | Good endpoint coverage, but missing explicit tests for key security requirements. |

---

## 3) Prioritized findings

### 🔴 Critical

<!-- 1. **Unauthenticated boleto download endpoint**  
   - File: `server/app/api/orders/[id]/boleto/[reference]/route.js`  
   - Evidence: no explicit `authenticateRequest`/`isUserAdmin` usage in route; endpoint returns PDF by URL parameters.  
   - Impact: potential unauthorized document access (order/payment metadata exposure vector).  
   - Recommendation: require `authenticateRequest`, enforce owner-or-admin authorization, and return 403 when unauthorized. -->

### 🟠 High

2. **Strict TypeScript requirement not implemented**  
   - Evidence: `server/**/*.ts` returns no runtime source files.  
   - Impact: violates project DoD and weakens contract guarantees.

<!-- 3. **No centralized runtime schema validation (Zod/Joi)**  
   - Evidence: no `zod`/`joi` usage in runtime code (`server/app/**`, `server/lib/**`).  
   - Impact: inconsistent input validation and higher risk of malformed payload edge cases. -->

4. **Pagination parsing can degrade to NaN on invalid query strings**  
   - Evidence:  
     - `server/app/api/users/route.js` lines 8–9  
     - `server/app/api/orders/route.js` lines 283–284  
   - Impact: malformed `page/pageSize` may propagate as invalid SQL params and trigger 500 instead of 400.

### 🟡 Medium

5. **Error payload contract inconsistency**  
   - Evidence: `server/app/api/cart/[id]/route.js` line 34 returns `{ message: ... }` while most routes return `{ error: ... }`.  
   - Impact: frontend/client error handling complexity and brittle consumers.

6. **English-only standard widely violated**  
   - Evidence examples:  
     - `server/lib/auth.js` lines 51, 98, 103  
     - `server/app/api/orders/[id]/boleto/[reference]/route.js` lines 60, 80  
   - Impact: breaks explicit repository standard and global maintainability goals.

<!-- 7. **Hardcoded admin bootstrap credential in script**  
   - Evidence: `server/scripts/ensure-admin-user.js` (`Admin@123`)  
   - Impact: risk if script is reused in non-local environments. -->

### 🟢 Positive notes

- SQL parameters are consistently parameterized (good SQL injection posture).
- Transaction handling in cart/order creation is robust (`BEGIN/COMMIT/ROLLBACK`).
- Authorization checks are present in most protected user/order/cart/payment endpoints.
- API test suite is healthy (42 passing tests).

---

## 4) Recommended remediation order

<!-- 1. Protect boleto download route with auth + owner/admin authorization.   -->
<!-- 2. Add schema validation layer for request bodies/query params (Zod/Joi).   -->
3. Standardize API error contract (`error.code`, `error.message`) and 4xx behavior for invalid input.  
4. Normalize pagination parsing with explicit integer guards and defaults.  
<!-- 5. Start TypeScript migration path for backend runtime (`lib` first, then `app/api`).   -->
6. Enforce English-only for runtime/test strings and comments.

---

## 5) Validation conclusion

The backend is operationally stable (build + tests pass), but **does not fully comply** with `context.MD` standards.  
Main blockers are:

- Critical authorization gap in boleto download route.
- Failure against strict TypeScript and English-only standards.
- Missing centralized runtime schema validation.

Overall compliance assessment: **Partial (needs corrective action before full approval).**
