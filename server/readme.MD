# 🧩 Server API — tester.com

Backend do projeto **tester.com**, implementado com **Next.js 14 (App Router)**, responsável pela API REST de produtos, usuários, carrinho e pedidos (`orders`), usando **PostgreSQL** como banco de dados.

## 📌 Resumo global do projeto

O repositório é dividido em três partes principais:

- **Frontend (`/src`)**: React + Vite para interface da loja.
- **Backend (`/server`)**: Next.js atuando como servidor de API.
- **Banco de dados**: PostgreSQL (normalmente via Docker Compose na raiz do projeto).

Fluxo principal:

1. Frontend consome endpoints em `http://localhost:3001/api`.
2. Backend valida dados/autenticação e persiste no PostgreSQL.
3. Usuários autenticam via JWT e operam o carrinho de forma isolada por usuário.

---

## 🧱 Stack e dependências do server

Dependências do `server/package.json`:

- `next@^14.2.0`: framework do backend (rotas em `app/api`).
- `pg@^8.11.3`: cliente PostgreSQL com pool de conexões.
- `bcrypt@^6.0.0`: hash/validação de senhas.
- `dotenv@^16.4.5`: leitura de variáveis de ambiente no script de seed.

Scripts disponíveis:

- `npm run dev` → sobe o servidor em `http://localhost:3001`
- `npm run build` → build de produção
- `npm run start` → inicia build de produção em `:3001`
- `npm run seed` → cria tabelas e popula produtos iniciais

---

## ⚙️ Execução do backend (passo a passo)

### 1) Pré-requisitos

- Node.js 18+
- Docker (recomendado para subir o PostgreSQL)

### 2) Subir banco PostgreSQL (na raiz do projeto)

O arquivo `docker-compose.yml` cria:

- container: `ecommerce_db`
- porta: `5432`
- database: `ecommerce`
- user/password: `postgres/postgres`

Inicie o banco na raiz do repositório:

- `docker compose up -d`

### 3) Configurar variáveis de ambiente no server

Arquivos usados atualmente:

- `server/.env.local`
	- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce`
- `server/.env`
	- `JWT_SECRET`
	- `JWT_EXPIRES_IN` (ex.: `1h`)
	- `JWT_ISSUER` (default esperado: `tester.com`)
	- `JWT_AUDIENCE` (default esperado: `tester.com-web`)

> `JWT_SECRET` deve ser forte (mínimo recomendado no código: 16 caracteres).

### 4) Instalar dependências e preparar banco

Dentro de `server/`:

- `npm install`
- `npm run seed`

O `seed` cria as tabelas:

- `products`
- `users`
- `cart_items`
- `user_roles`
- `orders`
- `order_items`

e importa produtos a partir de `src/data/products_mock.json`.

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

