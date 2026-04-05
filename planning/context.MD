# 🏗️ Software Development Template: `[Feature Name]`

This document serves as the official guide for developing new features. It ensures high quality, security, and global standards for our TypeScript and E-commerce environment.

## 1. Technical Planning & Architecture

Define the foundation before any implementation:

- **Data Flow:** Describe inputs, processing steps, and outputs.
- **Contracts:** Define interfaces and types before writing the logic.
- **Error Handling:** Map expected exceptions and standardized return messages.

## 2. Requirements Traceability Matrix (RTM)

The developer must provide this table before generating code:

| Requirement ID | Description | Acceptance Criteria (QA) | Unit Test Case |
| --- | --- | --- | --- |
| REQ-01 | `[Feature logic]` | `[Expected behavior]` | `should...()` |
| SEC-01 | `[Security rule]` | `[Validation criteria]` | `shouldThrowErrorOn...()` |

## 3. English-Only Standard

- **Strict English:** All code, variables, functions, classes, and comments must be in English.
- **Global Industry Terms:** Use standard E-commerce terminology (e.g., Cart, Checkout, SKU, Shipping, Discount).
- **No Portuguese:** Terms in Portuguese are strictly prohibited in the codebase.

## 4. Persona Definition & Context

> "You are a Senior Software Engineer specializing in TypeScript and E-commerce. Strictly follow software development best practices (Clean Code, SOLID, and Design Patterns). Write unit tests to validate the code and ensure that ESLint passes with zero warnings or errors."

## 5. Clean Code & Semantic Legibility

- **Descriptive Naming:** No abbreviations. Use names that describe intent (e.g., `isUserEligibleForDiscount` instead of `disc_ok`).
- **Self-Explanatory Functions:** Functions must follow the `verb + noun` pattern (e.g., `calculateTotalWeight`).
- **Boolean Prefixing:** Boolean variables must use prefixes like `is`, `has`, `should`, or `can`.
- **The "Why" Comments:** Comments should explain business logic decisions, not the code itself (the code must be readable).

## 6. Definition of Done (DoD)

- [ ] **Linting:** Code passes ESLint with zero warnings.
- [ ] **Typing:** Strict TypeScript (no `any` types).
- [ ] **Testing:** 100% coverage of the Requirements Traceability Matrix. Create API tests or e2e tests if applicable (web or mobile applications in TypeScript), E2E tests should not contain simulated data.
- [ ] **Language:** 100% English codebase.
- [ ] **Documentation:** Updated README or inline JSDoc where applicable.

## 💻 Implementation Example (TypeScript)

```typescript
/**
 * REQ-01: Calculate loyalty points based on purchase value.
 * SEC-01: Ensure input is a positive number.
 */

interface LoyaltyPointRequest {
  purchaseAmount: number;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD';
}

export class LoyaltyService {
  private readonly POINTS_MULTIPLIER = 0.1;

  /**
   * Calculates earned points ensuring semantic naming and security checks.
   */
  public calculateEarnedPoints(request: LoyaltyPointRequest): number {
    // SEC-01: Input Validation & Sanitization
    if (request.purchaseAmount < 0) {
      throw new Error('Purchase amount cannot be negative.');
    }

    const basePoints = request.purchaseAmount * this.POINTS_MULTIPLIER;

    return Math.floor(basePoints);
  }
}
```

---

Created for Reinaldo M R Junior.

