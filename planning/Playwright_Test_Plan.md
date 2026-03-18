## Playwright Test Plan — tester.com

Este documento formaliza a execução do plano de testes automatizados com Playwright para frontend e server.

## Objetivo

Cobrir os principais fluxos implementados no sistema, com separação entre:

- **UI E2E (frontend)**: navegação, estado, carrinho, checkout, autenticação e i18n.
- **API (server)**: produtos, usuários e carrinho via `APIRequestContext`.

## Estrutura implementada

- `playwright.config.ts`
- `e2e/fixtures/ui.fixture.ts`
- `e2e/fixtures/test-data.fixture.ts`
- `e2e/helpers/auth.ts`
- `e2e/helpers/selectors.ts`
- `e2e/data/products.mock.ts`
- `e2e/specs/frontend/*.spec.ts`
- `e2e/specs/api/*.spec.ts`

## Matriz de cobertura — Frontend

| Feature/Página | Casos automatizados |
|---|---|
| Catálogo (`/`) | listagem inicial, busca por texto, filtro por categoria, estado vazio, navegação para detalhe |
| Detalhe (`/product/:id`) | render de dados, adicionar ao carrinho, atualização de badge, ID inválido, voltar ao catálogo |
| Carrinho/Checkout (`/cart` → `/thank-you`) | checkout logado, redirecionamento para login com `next`, botão desabilitado com carrinho vazio |
| Login (`/login`) | login válido, erro de credenciais, obrigatoriedade de campos, persistência após reload |
| Registro (`/register`) | fluxo PF feliz, validações obrigatórias |
| Idioma (PT/EN) | alternância em runtime e persistência após reload |

## Matriz de cobertura — API

| Endpoint | Casos automatizados |
|---|---|
| `GET/POST/PUT/DELETE /api/products` | CRUD completo, filtro por categoria, erro por payload inválido |
| `POST /api/users/register` | sucesso, payload inválido, duplicidade de e-mail |
| `POST /api/users/login` | sucesso, credenciais inválidas |
| `GET/POST/DELETE /api/cart` | adicionar, incrementar quantidade, listar, remover, validações de payload |

## Execução

Pré-condições:

1. Dependências instaladas na raiz e no `server/`.
2. Backend disponível em `http://127.0.0.1:3001`.
3. Frontend disponível em `http://127.0.0.1:4173`.
4. Banco configurado para o backend (quando executar specs de API com dados reais).

Scripts:

- `npm run test:e2e`
- `npm run test:e2e:ui`
- `npm run test:e2e:debug`
- `npm run test:e2e:headed`
- `npm run test:e2e:report`

## Estratégia de dados e estabilidade

- Uso de dados únicos por execução para evitar colisão em constraints de usuários.
- Uso de mocks de API nas specs de frontend para reduzir flakiness.
- `waitForPageLoad` centralizado para evitar `waitForTimeout` fixo.
- Retentativas automáticas (`retries`) e coleta de evidências (`trace`, `screenshot`, `video`) em falhas.

## Roadmap incremental

1. **Smoke suite**: cenários felizes principais.
2. **Regressão crítica**: cenários negativos de auth, carrinho e APIs.
3. **Regressão completa**: expansão de casos de borda e execução multi-browser.
