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

## 6. Definition of Done (DoD)

- [x] **Linting:** Code passes ESLint with zero warnings. (`npm run lint` passes)
- [x] **Typing:** Strict TypeScript (no `any` types). (`npm run typecheck` passes and all `any` were removed)
- [ ] **Testing:** 100% coverage of the Requirements Traceability Matrix. Create API tests or e2e tests if applicable (web or mobile applications in TypeScript), E2E tests should not contain simulated data.
  - *API Tests:* `42/42` passing.
  - *E2E Tests (web):* Pending. `51 passed`, `4 failed`, `5 flaky`. This is a quality gate that must pass.
- [x] **Language:** 100% English codebase. (all source files and comments are aligned, except Pact consumer states which must match the frontend contract)
- [x] **Documentation:** Updated README or inline JSDoc where applicable.

## Requirements Traceability Matrix (RTM)

Validation command batch used:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `cd ../web && npm run test:e2e` (local Playwright Chromium suite)

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

### 5) Rodar API em desenvolvimento

Ainda dentro de `server/`:

- `npm run dev`

Base URL local: **`http://localhost:3001/api`**

---

## 🔐 Autenticação

O login retorna um token JWT (`tokenType: Bearer`).

Endpoints protegidos (atualmente):

| Endpoint | Acesso |
|---|---|
| `GET /api/cart` | Usuário autenticado (próprio carrinho) |
| `POST /api/cart` | Usuário autenticado (próprio carrinho) |
| `DELETE /api/cart` | Usuário autenticado (próprio carrinho) |
| `GET /api/users` | Admin |
| `POST /api/users` | Admin |
| `GET /api/users/:id` | Admin ou próprio usuário |
| `PUT /api/users/:id` | Admin ou próprio usuário |
| `DELETE /api/users/:id` | Admin |
| `POST /api/users/:id/terminate` | Admin ou próprio usuário |
| `GET /api/orders` | Autenticado (escopo por usuário; admin pode filtrar todos) |
| `POST /api/orders` | Usuário autenticado |
| `GET /api/orders/:id` | Dono do pedido ou Admin |
| `PUT /api/orders/:id` | Dono do pedido ou Admin (com regras de transição) |
| `DELETE /api/orders/:id` | Dono do pedido ou Admin (cancelamento lógico) |

Envie o header:

- `Authorization: Bearer <accessToken>`

As regras de autorização validam se o `userId` da requisição corresponde ao usuário do token.

No `POST /api/cart`, o usuário é sempre derivado do token (não é aceito `userId` no body).

---

## 🔌 Endpoints implementados

Base: `http://localhost:3001/api`

### Produtos

#### `GET /products`
Lista produtos. Suporta filtro opcional por categoria.

- Query opcional: `?category=<categoria>`

#### `POST /products`
Cria produto.

Body mínimo:

```json
{
	"name": "Notebook X",
	"price": 4999.9
}
```

Campos aceitos adicionais: `description`, `category`, `image`, `manufacturer`, `line`, `model`.

#### `GET /products/:id`
Retorna produto por ID.

#### `PUT /products/:id`
Atualiza produto por ID.

#### `DELETE /products/:id`
Remove produto por ID.

---

### Usuários

#### `POST /users/register`
Cadastra usuário com validação de unicidade para e-mail, CPF e CNPJ.

Campos obrigatórios:

- `first_name`
- `last_name`
- `email`
- `password`

Campos suportados (opcionais conforme PF/PJ):

- `person_type` (`PF` padrão)
- `phone`, `cpf`, `cnpj`, `company_name`
- `address_zip`, `address_street`, `address_number`, `address_complement`
- `address_neighborhood`, `address_city`, `address_state`
- `residence_proof_filename`

#### `POST /users/login`
Autentica usuário por e-mail e senha.

Body:

```json
{
	"email": "usuario@email.com",
	"password": "senha"
}
```

Resposta de sucesso inclui:

- `accessToken`
- `tokenType` (`Bearer`)
- `expiresIn`
- `user` (sem `password`)

#### `GET /users`
Lista todos os usuários cadastrados. **Requer autenticação de admin.**

Query params opcionais:

- `?page=<número>` — página (paginação)
- `?pageSize=<número>` — itens por página
- `?status=<all|active|closed>` — filtro por status da conta

#### `POST /users`
Cadastra um novo usuário diretamente pelo painel admin. **Requer autenticação de admin.**

Body:

```json
{
	"first_name": "Maria",
	"last_name": "Souza",
	"email": "maria@email.com",
	"password": "senha",
	"role": "user"
}
```

> `role` aceita `"user"` (padrão) ou `"admin"`.

#### `GET /users/:id`
Busca um usuário pelo ID. **Requer autenticação de admin ou próprio usuário.**

#### `PUT /users/:id`
Edita os dados de um usuário existente. **Requer autenticação de admin ou próprio usuário.**

Body: qualquer campo editável do usuário (mesmos campos aceitos no registro).

#### `DELETE /users/:id`
Remove permanentemente um usuário do banco (hard delete). **Requer autenticação de admin.**

#### `POST /users/:id/terminate`
Encerra a conta do usuário com ofuscação de dados pessoais (soft delete/LGPD). **Requer autenticação de admin ou próprio usuário.**

---

### Carrinho (protegido por JWT)

#### `GET /cart?userId=<id>`
Lista itens do carrinho do usuário autenticado.

- Se `userId` não for enviado, usa o usuário do token.
- Se `userId` for diferente do token, retorna `403`.

#### `GET /cart/:id`
Busca um item específico do carrinho pelo ID (`cart_items.id`) para o usuário autenticado.

Se o ID não existir (ou não pertencer ao usuário autenticado), retorna:

```json
{
	"message": "Carrinho não encontrado"
}
```

#### `POST /cart`
Adiciona itens no carrinho em lote (ou incrementa quantidade se já existir).

Body:

```json
{
	"products": [
		{
			"productId": 10,
			"quantity": 1
		},
		{
			"productId": 20,
			"quantity": 3
		}
	]
}
```

Regras de validação:

- `products` deve ser um array não vazio.
- `productId` deve ser inteiro positivo.
- `quantity` deve ser inteiro entre `1` e `99`.
- `quantity` é opcional e assume `1` quando omitida.
- Não é permitido repetir o mesmo `productId` no mesmo payload.

Mensagens de erro relevantes:

- `Não é permitido possuir produto duplicado`
- `Produto não encontrado`
- `Produto não possui quantidade suficiente`
- `Token de acesso ausente, inválido, expirado ou usuário do token não existe mais`

#### `DELETE /cart`
Remove item do carrinho pelo `cartItemId`.

Body:

```json
{
	"cartItemId": 7
}
```

---

### Orders / Pedidos (protegido por JWT)

O endpoint de `orders` representa o fechamento do carrinho (checkout).

#### Como funciona o fluxo de `POST /orders`

1. Valida autenticação via Bearer token.
2. Lê os itens do carrinho do usuário autenticado.
3. Se carrinho estiver vazio, retorna `400`.
4. Abre transação no banco e:
   - cria o registro em `orders`;
   - salva snapshot dos itens em `order_items`;
   - calcula totais (`subtotal`, `shipping_total`, `discount_total`, `grand_total`);
   - limpa o carrinho (`cart_items`) do usuário.
5. Faz `COMMIT` e retorna o pedido completo.

Se a requisição vier com `Idempotency-Key` já utilizado para o mesmo usuário, a API retorna o pedido já existente (status `200`) e evita duplicidade.

#### `POST /orders`
Cria pedido com base no carrinho do usuário autenticado.

Headers recomendados:

- `Authorization: Bearer <accessToken>`
- `Idempotency-Key: <chave-unica-opcional>`

Body (opcional):

```json
{
	"shippingTotal": 10,
	"discountTotal": 5,
	"paymentMethod": "pix",
	"shippingAddress": {
		"zip": "01310-100",
		"city": "São Paulo",
		"state": "SP"
	},
	"billingInfo": {
		"document": "123.456.789-00"
	}
}
```

Respostas principais:

- `201` pedido criado
- `200` idempotência (pedido já existente)
- `400` carrinho vazio / payload inválido
- `401` não autenticado

#### `GET /orders`
Lista pedidos com paginação.

Query params opcionais:

- `page` (default `1`)
- `pageSize` (default `20`, máx `100`)
- `status` (`created|paid|processing|shipped|delivered|cancelled`)
- `userId` (somente admin)

Exemplo de resposta:

```json
{
	"page": 1,
	"pageSize": 10,
	"total": 2,
	"items": [
		{
			"id": 1,
			"order_number": "ORD-20260327-000001",
			"user_id": 10,
			"status": "created",
			"subtotal": 150.99,
			"shipping_total": 0,
			"discount_total": 0,
			"grand_total": 150.99,
			"currency": "BRL",
			"payment_method": "pix",
			"created_at": "2026-03-27T20:00:00.000Z"
		}
	]
}
```

#### `GET /orders/:id`
Busca detalhes do pedido (inclui `items`).

Respostas:

- `200` pedido encontrado
- `403` sem permissão
- `404` pedido não encontrado

#### `PUT /orders/:id`
Atualiza pedido com regras de transição de status.

Transições válidas:

- `created -> paid|cancelled`
- `paid -> processing|cancelled`
- `processing -> shipped|cancelled`
- `shipped -> delivered`

Body exemplo:

```json
{
	"status": "paid",
	"paymentMethod": "credit_card"
}
```

Respostas:

- `200` atualizado
- `400` transição inválida / payload inválido
- `403` sem permissão

#### `DELETE /orders/:id`
Não remove fisicamente o pedido; faz cancelamento lógico.

Respostas:

- `200` pedido cancelado
- `400` pedido não elegível para cancelamento
- `403` sem permissão
- `404` pedido não encontrado

---

## 🗂️ Estrutura relevante do server

```text
server/
├── app/api/
│   ├── cart/route.js
│   ├── orders/route.js
│   ├── orders/[id]/route.js
│   ├── products/route.js
│   ├── products/[id]/route.js
│   └── users/
│       ├── route.js              ← GET (listar) e POST (criar) — admin
│       ├── login/route.js
│       ├── register/route.js
│       └── [id]/
│           ├── route.js          ← GET, PUT, DELETE por ID
│           └── terminate/route.js ← POST encerrar conta
├── lib/
│   ├── auth.js
│   └── db.js
├── scripts/
│   └── seed.js
├── .env
├── .env.local
└── package.json
```

---

## ✅ Observações rápidas

- O backend usa SQL parametrizado (boa prática contra SQL Injection).
- O parser do `pg` converte `NUMERIC` para `float` no retorno.
- O carrinho possui restrição `UNIQUE (user_id, product_id)` com `ON CONFLICT` para upsert.
- Orders usam idempotência opcional com `Idempotency-Key` para evitar duplicidade em reenvio.
- Senhas são hasheadas com `bcrypt` antes de persistir.

