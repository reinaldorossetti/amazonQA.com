1. Security & Validation (Security by Design)

1.1 Input Sanitization: Prevent XSS, Injection, and Malicious Data. Follow OWASP guidelines for input validation and sanitization.
1.2 Schema Validation: Use libraries (like Zod or Joi) to validate data at runtime.
1.3 PII Protection: Identify and mask Personally Identifiable Information.
1.4 Least Privilege: Functions must only access the data strictly necessary for their execution.
1.5 SonarQube/Security Linting: Ensure no critical security issues are present in the codebase.

2. Definition of Done (DoD)
[ ] Linting: Code passes ESLint with zero warnings.
[ ] Typing: Strict TypeScript (no any types).
[ ] Testing: 100% coverage of the Requirements Traceability Matrix.
[ ] Language: 100% English codebase.
[ ] Documentation: Updated README or inline JSDoc where applicable.
