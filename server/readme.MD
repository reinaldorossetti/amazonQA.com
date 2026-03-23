# 🧩 Server API — tester.com

Backend do projeto **tester.com**, implementado com **Next.js 14 (App Router)**, responsável pela API REST de produtos, usuários e carrinho, usando **PostgreSQL** como banco de dados.

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

e importa produtos a partir de `src/data/products_mock.json`.

### 5) Rodar API em desenvolvimento

Ainda dentro de `server/`:

- `npm run dev`

Base URL local: **`http://localhost:3001/api`**

---

## 🔐 Autenticação

O login retorna um token JWT (`tokenType: Bearer`).

Endpoints protegidos (atualmente):

- `GET /api/cart`
- `POST /api/cart`
- `DELETE /api/cart`

Envie o header:

- `Authorization: Bearer <accessToken>`

As regras de autorização validam se o `userId` da requisição corresponde ao usuário do token.

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

---

### Carrinho (protegido por JWT)

#### `GET /cart?userId=<id>`
Lista itens do carrinho do usuário autenticado.

- Se `userId` não for enviado, usa o usuário do token.
- Se `userId` for diferente do token, retorna `403`.

#### `POST /cart`
Adiciona item no carrinho (ou incrementa quantidade se já existir).

Body:

```json
{
	"userId": 1,
	"productId": 10,
	"quantity": 1
}
```

> `userId` pode ser omitido; nesse caso é usado o usuário autenticado.

#### `DELETE /cart`
Remove item do carrinho pelo `cartItemId`.

Body:

```json
{
	"cartItemId": 7
}
```

---

## 🗂️ Estrutura relevante do server

```text
server/
├── app/api/
│   ├── cart/route.js
│   ├── products/route.js
│   ├── products/[id]/route.js
│   └── users/
│       ├── login/route.js
│       └── register/route.js
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
- Senhas são hasheadas com `bcrypt` antes de persistir.

