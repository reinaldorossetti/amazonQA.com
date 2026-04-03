# 🛒 AmazonQA — Loja Online

Aplicação de e-commerce completa construída com **React + Vite** no frontend e **Next.js + PostgreSQL** no backend, com design visual inspirado na Amazon. Inclui catálogo de produtos, sistema de login/cadastro de usuários, gestão de carrinho, fluxo de pedidos (`orders`) com idempotência e tela de pagamentos (`payments`) com cartão, PIX, boleto e split payment, além de internacionalização PT/EN.

## 🎯 Visão Executiva

Projeto completo de e-commerce com foco em qualidade de software, cobrindo todo o ciclo da compra:

- Navegação do catálogo, busca e detalhes de produtos.
- Cadastro/login com autenticação e controle de sessão.
- Carrinho persistido no backend com regras de integridade e Segurança com criptografia em hash adicionando um salt na aplicação.
- Checkout com criação de pedido (`orders`) usando `Idempotency-Key`.
- Tela de pagamentos (`payments`) com cartão de crédito, PIX, boleto e pode dividir o pagamento em duas formas de pagamentos distintas.
- Página de confirmação com resumo do pedido, QR mock de PIX e boleto em PDF mock.
- API documentada e validada por múltiplas camadas de teste automatizado, ou seja temos testes dentro do sistema e fora.

## 🧪 Pirâmide de Testes

A estratégia de qualidade segue a pirâmide de testes: base ampla de testes unitários, camada intermediária para contratos/API e topo com E2E de interface.

![Pirâmide de Testes - Estratégia Escalável](img/pyramid-scalable.png)

```mermaid
flowchart BT
    A["E2E UI (Playwright)<br/>Fluxos críticos de ponta a ponta"] --> B["API e Contrato (Playwright API + Pact)<br/>Integração entre serviços e contratos"]
    B --> C["Unitários (Vitest)<br/>Base ampla: regras e componentes isolados"]
```

**Relatórios públicos da pirâmide e da documentação:**

- **Índice geral de testes:** https://reinaldorossetti.github.io/amazonQA.com/tests-report/
- **Cobertura unitária (Vitest):** [Coverage](https://reinaldorossetti.github.io/amazonQA.com/tests-report/unit-tests/coverage/index.html)
- **Testes de API (Playwright):** [Playwright API](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-api/index.html)
- **Testes de contrato (Pact):** [Pact Contract Report](https://reinaldorossetti.github.io/amazonQA.com/tests-report/contract-tests/pacts/tester-web-frontend-tester-backend-api.json)
- **E2E Frontend (Playwright / Chromium):** [Browser Chromium](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-chromium/index.html)
- **E2E Frontend (Playwright / WebKit):** [Browser WebKit](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-webkit/index.html)
- **E2E Frontend (Playwright / Edge):** [Browser Edge](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-edge/index.html)
- **Swagger da API:** https://reinaldorossetti.github.io/amazonQA.com/tests-report/swagger/index.html
- **Guia completo de Pact:** [Guia de Testes de Pacto](docs/pact-tests-guide.md)

---

## 📊 Relatórios e Dashboards (GitHub Pages)

Acompanhe os resultados diários, a cobertura e a documentação pública disponibilizada usando **GH-Pages** através dos nossos relatórios:

- 📑 **Todos os Testes (Índice):** [Visualizar Relatórios Gerais](https://reinaldorossetti.github.io/amazonQA.com/tests-report/)
- 📘 **Documentação Swagger (API):** [Swagger UI](https://reinaldorossetti.github.io/amazonQA.com/tests-report/swagger/index.html)
- 🧪 **Cobertura de Unitários/Unidade (Vitest):** [Unit Tests Coverage](https://reinaldorossetti.github.io/amazonQA.com/tests-report/unit-tests/coverage/index.html)
- 🔌 **Relatório de Testes de API:** [Playwright API Report](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-api/index.html)
- 🤝 **Relatório de Testes de Contrato (Pact):** [Pact Contract Report](https://reinaldorossetti.github.io/amazonQA.com/tests-report/contract-tests/pacts/tester-web-frontend-tester-backend-api.json)
- 📘 **Guia dos Testes de Pacto:** [pact-tests-guide.md](docs/pact-tests-guide.md)

**📱 Relatórios UI E2E (Playwright por Browser):**
- 🌐 [Relatório Frontend - Chromium](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-chromium/index.html)
- 🌐 [Relatório Frontend - WebKit](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-webkit/index.html)
- 🌐 [Relatório Frontend - Edge](https://reinaldorossetti.github.io/amazonQA.com/tests-report/playwright-report-frontend-edge/index.html)

---

## 🤝 Testes de Contrato (Pact)

Os testes de contrato validam o acordo entre **frontend (consumer)** e **backend (provider)** sem depender de uma suíte E2E completa.

- 📄 **Report do contrato publicado (GH Pages):** [Pact Contract Report](https://reinaldorossetti.github.io/amazonQA.com/tests-report/contract-tests/pacts/tester-web-frontend-tester-backend-api.json)
- 📚 **Guia completo (implementação + execução):** [Guia de Testes de Pacto](docs/pact-tests-guide.md)

Esse fluxo garante que mudanças na API não quebrem o consumo esperado no frontend e adiciona uma camada extra de segurança na esteira de CI.

---
Passo a Passo para Rodar a Aplicação Localmente:
````
git clone https://github.com/reinaldorossetti/amazonQA.com.git
cd amazonQA.com
docker-compose -f docker-compose.yml up

# Backend
cd server
npm install
npm run seed
npm run dev

# Front-end, abra um outro terminal para não interromper o backend.
cd ..
npm install
npm run build
npm run preview

````


## ⚛️ Frontend — React + Vite

### O que é e o que faz neste projeto
O **React** é a biblioteca de UI responsável por toda a camada visual e interativa da aplicação. O **Vite** é a ferramenta de build moderna que substitui o Webpack, entregando um servidor de desenvolvimento ultra-rápido com Hot Module Replacement (HMR).

No projeto, o React gerencia:
- **Roteamento SPA** via `react-router-dom` (catálogo, detalhes do produto, carrinho, login, cadastro, checkout).
- **Estado global** via Context API (`AuthContext`, `DatabaseContext`, `LanguageContext`).
- **Componentes de UI** com a biblioteca **Material-UI (MUI v7+)** replicando estética Amazon.
- **Chamadas à API REST** encapsuladas em `src/db/api.js`, separando a camada de dados da camada de apresentação.

### Vantagens do React + Vite aqui
| Vantagem | Detalhe |
|---|---|
| ⚡ **HMR instantâneo** | Mudanças no código refletem no browser em milissegundos, sem reload completo. |
| 📦 **Bundle enxuto** | Vite usa Rollup no build; entrega apenas o que é importado (tree-shaking nativo). |
| 🧩 **Componentização** | Cada tela (Login, Catalog, Cart) é um componente isolado, de fácil manutenção e teste. |
| 🔌 **Proxy de desenvolvimento** | O Vite proxy (`/api → :3001`) elimina problemas de CORS em desenvolvimento sem alterar o código. |
| 🌐 **i18n via Context API** | Internacionalização PT/EN sem dependências externas, usando apenas `useState` + `localStorage`. |
| 🧪 **IDs semânticos** | Todos os elementos interativos têm `id` descritivo, facilitando automação com Playwright. |

---

## 🟢 Backend + Banco de Dados — Next.js + PostgreSQL (Docker)

### O que é e o que faz neste projeto
O **Next.js 14** (App Router) atua como servidor de API REST, processando todas as operações de leitura e escrita no banco. O **PostgreSQL 16** é o banco de dados relacional robusto, executado em um container Docker isolado, gerenciado pelo `pg` (node-postgres) via pool de conexões.

No projeto, o Next.js gerencia:
- **API Routes** (`/api/products`, `/api/users`, `/api/cart`) que recebem requisições do frontend.
- **Regras de negócio** como validação de unicidade de e-mail/CPF/CNPJ no cadastro.
- **Conversão de tipos** (ex.: `NUMERIC → float` via `pg.types`) antes de retornar ao cliente.
- **Seed do banco** via `server/scripts/seed.js`, criando tabelas e populando os produtos.

O **PostgreSQL** gerencia:
- Três tabelas relacionadas: `products`, `users` e `cart_items` (com FK e `ON DELETE CASCADE`).
- **Upsert no carrinho**: `INSERT ... ON CONFLICT DO UPDATE SET quantity = quantity + N`, garantindo integridade sem duplicações.
- Isolamento de dados por usuário via `user_id` nas queries de carrinho.

### Vantagens do Next.js + PostgreSQL aqui
| Vantagem | Detalhe |
|---|---|
| 🚀 **API Routes nativas** | Sem precisar criar um servidor Express separado; as rotas ficam em `app/api/` e seguem o padrão web Fetch. |
| 🔒 **Segurança de dados** | Lógica crítica (validação, autenticação) fica no servidor, nunca exposta ao browser. |
| 🐳 **Docker portable** | `docker compose up -d` sobe um PostgreSQL configurado e pronto; elimina instalação manual do banco. |
| 💾 **Persistência real** | Volume nomeado `postgres_data` garante que os dados sobrevivem a restarts do container. |
| 📐 **Integridade relacional** | FK `cart_items → users` e `cart_items → products` com `ON DELETE CASCADE` mantém o banco sempre consistente. |
| ⚙️ **Pool de conexões** | Singleton `pg.Pool` em `lib/db.js` reutiliza conexões, evitando overhead de abertura a cada request. |
| 🔄 **Seed idempotente** | `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT DO NOTHING` garante que rodar `npm run seed` múltiplas vezes é seguro. |

---

## 💾 Banco de Dados — PostgreSQL (Docker)

### Tabelas e Relacionamentos

```sql
-- Produtos do catálogo
products (id SERIAL PK, name, price NUMERIC(10,2), description,
          category, image, manufacturer, line, model)

-- Usuários registrados
users (id SERIAL PK, person_type, first_name, last_name,
       email UNIQUE NOT NULL, phone, password, cpf UNIQUE,
       cnpj UNIQUE, company_name, address_zip, address_street,
       address_number, address_complement, address_neighborhood,
       address_city, address_state, residence_proof_filename,
       created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
       is_active BOOLEAN, account_closed_at TIMESTAMPTZ)

-- Perfis de acesso por usuário
user_roles (id SERIAL PK,
            user_id -> users.id ON DELETE CASCADE,
            role, created_at TIMESTAMPTZ,
            UNIQUE (user_id, role))

-- Carrinho (relaciona users ↔ products)
cart_items (id SERIAL PK,
            user_id  → users.id    ON DELETE CASCADE,
            product_id → products.id ON DELETE CASCADE,
            quantity DEFAULT 1,
            added_at TIMESTAMPTZ,
            UNIQUE (user_id, product_id))

-- Pedidos
orders (id SERIAL PK, order_number UNIQUE,
        user_id -> users.id ON DELETE CASCADE,
        status DEFAULT 'created',
        subtotal, shipping_total, discount_total, grand_total NUMERIC(10,2),
        currency DEFAULT 'BRL', payment_method, idempotency_key,
        shipping_address JSONB, billing_info JSONB,
        created_at, updated_at, cancelled_at TIMESTAMPTZ)

-- Itens do pedido
order_items (id SERIAL PK,
             order_id -> orders.id ON DELETE CASCADE,
             product_id -> products.id ON DELETE RESTRICT,
             product_name_snapshot, unit_price_snapshot NUMERIC(10,2),
             quantity, line_total NUMERIC(10,2),
             created_at TIMESTAMPTZ)

-- Pagamentos do pedido
payments (id SERIAL PK,
          order_id -> orders.id ON DELETE CASCADE,
          user_id -> users.id ON DELETE CASCADE,
          method, amount NUMERIC(10,2), status,
          card_brand, provider_reference, metadata JSONB,
          created_at, updated_at TIMESTAMPTZ)
```

### Arquivos de Infraestrutura

| Arquivo | Responsabilidade |
|---|---|
| `docker-compose.yml` | Container `postgres:16-alpine`, porta `5432`, volume `postgres_data`. |
| `server/.env.local` | `DATABASE_URL=postgresql://ecommerce_user:ecommerce_pass@localhost:5432/ecommerce` |
| `server/lib/db.js` | Singleton `pg.Pool` com *type parser* de `NUMERIC → float`. |
| `server/scripts/seed.js` | DDL idempotente (`IF NOT EXISTS`) + seed de produtos + estruturas de `orders/payments`. |
| `src/db/api.js` | Cliente Fetch no frontend com as mesmas assinaturas da camada de banco anterior. |

---

## 🔌 Documentação da API REST

Base URL (dev): **`http://localhost:3001/api`**

> Todas as requisições com body usam `Content-Type: application/json`.
> Em caso de erro, a resposta sempre é `{ "error": "<mensagem>" }`.

---

### 📦 Produtos

#### `GET /api/products`
Lista todos os produtos, ordenados por nome.

| Query Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `category` | string | ❌ | Filtra produtos por categoria exata. |

**Resposta 200:**
```json
[
  {
    "id": 1,
    "name": "Relógio Elegante",
    "price": 50.99,
    "description": "Relógio de pulso clássico...",
    "category": "Acessórios",
    "image": "https://...",
    "manufacturer": "TimeX",
    "line": "Classic",
    "model": "TX-100"
  }
]
```

---

#### `GET /api/products/:id`
Retorna um produto específico pelo ID.

| Path Param | Tipo | Descrição |
|---|---|---|
| `id` | integer | ID do produto no banco. |

**Resposta 200:** Objeto produto (mesmo formato acima).
**Resposta 404:** `{ "error": "Produto não encontrado" }`

---

#### `POST /api/products`
Cria um novo produto (**acesso admin**).

**Body (JSON):**
```json
{
  "name": "Meu Produto",
  "price": 99.90,
  "description": "...",
  "category": "Eletrônicos",
  "image": "https://...",
  "manufacturer": "...",
  "line": "...",
  "model": "..."
}
```

**Resposta 201:** Objeto produto criado com o `id` gerado.
**Resposta 400:** Se `name` ou `price` estiverem ausentes.
**Resposta 401:** Requisição sem autenticação.
**Resposta 403:** Perfil sem permissão de administrador.

---

#### `PUT /api/products/:id`
Atualiza um produto existente (**acesso admin**). Aceita os mesmos campos do `POST`.

**Resposta 200:** Objeto produto atualizado.
**Resposta 401:** Requisição sem autenticação.
**Resposta 403:** Perfil sem permissão de administrador.
**Resposta 404:** `{ "error": "Produto não encontrado" }`

---

#### `DELETE /api/products/:id`
Remove um produto pelo ID (**acesso admin**).

**Resposta 200:** `{ "message": "Produto removido" }`
**Resposta 401:** Requisição sem autenticação.
**Resposta 403:** Perfil sem permissão de administrador.
**Resposta 404:** `{ "error": "Produto não encontrado" }`

---

#### `DELETE /api/users/:id`
Remove permanentemente um usuário pelo ID (**acesso admin**).

**Resposta 200:** `{ "message": "Usuário removido permanentemente", "id": <number> }`
**Resposta 401:** Requisição sem autenticação.
**Resposta 403:** Perfil sem permissão de administrador.
**Resposta 404:** `{ "error": "Usuário não encontrado" }`

---

### 👤 Usuários

#### `POST /api/users/register`
Registra um novo usuário. Valida unicidade de e-mail, CPF e CNPJ.

**Body (JSON):**
```json
{
  "person_type": "PF",
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@email.com",
  "phone": "(11) 91234-5678",
  "password": "senha@123",
  "cpf": "123.456.789-09",
  "address_zip": "01310-100",
  "address_street": "Av. Paulista",
  "address_number": "1578",
  "address_complement": "Ap 21",
  "address_neighborhood": "Bela Vista",
  "address_city": "São Paulo",
  "address_state": "SP"
}
```

> Para Pessoa Jurídica (PJ): substitua `cpf` por `cnpj` e forneça `company_name`.

**Resposta 201:**
```json
{
  "id": 1,
  "person_type": "PF",
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@email.com",
  "created_at": "2026-03-17T14:00:00.000Z"
}
```

**Resposta 409:** Se e-mail, CPF ou CNPJ já existirem.
**Resposta 400:** Se campos obrigatórios (`first_name`, `last_name`, `email`, `password`) estiverem ausentes.

---

#### `POST /api/users/login`
Autentica um usuário por e-mail e senha.

**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "password": "senha@123"
}
```

**Resposta 200:** Dados do usuário **sem o campo `password`**.
```json
{
  "id": 1,
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@email.com",
  "person_type": "PF"
}
```

**Resposta 401:** `{ "error": "Credenciais inválidas." }`

---

### 🛒 Carrinho

#### `GET /api/cart?userId=<id>`
Lista os itens do carrinho do usuário, com join nos dados do produto.

| Query Param | Tipo | Obrigatório |
|---|---|---|
| `userId` | integer | ✅ |

**Resposta 200:**
```json
[
  {
    "id": 10,
    "quantity": 2,
    "added_at": "2026-03-17T14:00:00Z",
    "product_id": 5,
    "name": "Smartphone",
    "price": 299.99,
    "image": "https://...",
    "category": "Eletrônicos"
  }
]
```

---

#### `POST /api/cart`
Adiciona um produto ao carrinho. Se já existir, **incrementa** a quantidade via `ON CONFLICT DO UPDATE`.

**Body (JSON):**
```json
{
  "products": [
    { "productId": 5, "quantity": 1 },
    { "productId": 8, "quantity": 2 }
  ]
}
```

**Resposta 201:** `{ "items": [...], "processed": 2 }`.
**Resposta 400:** Se `products` estiver vazio, com `productId` inválido ou item duplicado.

---

#### `DELETE /api/cart`
Remove um item do carrinho pelo ID do item (não do produto).

**Body (JSON):**
```json
{
  "cartItemId": 10
}
```

**Resposta 200:** `{ "message": "Item removido do carrinho" }`
**Resposta 404:** `{ "error": "Item não encontrado" }`

---

### 📦 Pedidos (`orders`)

> Endpoints protegidos por autenticação (`Authorization: Bearer <token>`).

#### `POST /api/orders`
Cria pedido com os itens do carrinho autenticado. Se o carrinho estiver vazio, aceita `items` no body.

- Header opcional: `Idempotency-Key` para evitar duplicidade.
- Ao criar pedido com sucesso, o carrinho do usuário é limpo.

**Body (JSON):**
```json
{
  "shippingTotal": 0,
  "discountTotal": 0,
  "paymentMethod": null,
  "shippingAddress": null,
  "billingInfo": null,
  "items": [
    { "productId": 5, "quantity": 1 }
  ]
}
```

**Resposta 201:** Pedido completo com `items`.
**Resposta 200:** Pedido existente, quando a mesma `Idempotency-Key` for reaproveitada.

---

#### `GET /api/orders?page=1&pageSize=20&status=created`
Lista pedidos paginados do usuário autenticado. Para admin, aceita `userId` como filtro adicional.

**Resposta 200:**
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "items": [
    {
      "id": 101,
      "order_number": "ORD-20260328-000101",
      "status": "created",
      "grand_total": 499.9
    }
  ]
}
```

---

#### `GET /api/orders/:id`
Retorna o pedido com os itens (`order_items`) e valida ownership (ou perfil admin).

#### `PUT /api/orders/:id`
Atualiza status do pedido respeitando transições válidas:

- `created -> pending_payment | paid | cancelled`
- `pending_payment -> paid | cancelled`
- `paid -> processing | cancelled`
- `processing -> shipped | cancelled`
- `shipped -> delivered`

`paymentMethod` só pode ser alterado por admin.

#### `DELETE /api/orders/:id`
Cancela o pedido (status `cancelled`), exceto se já estiver `delivered`.

---

### 💳 Pagamentos (`payments`)

> Endpoints protegidos por autenticação (`Authorization: Bearer <token>`), exceto download de boleto.

#### `POST /api/orders/:id/payments`
Processa pagamento para o pedido com métodos: `credit`, `debit`, `pix`, `boleto`.

- Aceita pagamento parcial (split em duas chamadas).
- Cartão com final `0000` é simulado como `failed`.
- PIX/Boleto retornam `pending` com metadados mock (QR code, linha digitável, etc).

**Body (JSON):**
```json
{
  "method": "credit",
  "amount": 250.00,
  "holderName": "João da Silva",
  "cardNumber": "4111111111111111",
  "expiry": "12/30",
  "cvv": "123",
  "installments": 2
}
```

**Resposta 201:** Objeto de pagamento criado em `payments`.

---

#### `GET /api/orders/:id/payments/:paymentId`
Consulta status e metadados de um pagamento específico.

#### `GET /api/orders/:id/boleto/:reference`
Gera/download de PDF mock do boleto (`application/pdf`).

---

## 🧩 Componentes do Frontend

| Componente | Descrição |
|---|---|
| `NavBar` | Logo, busca ao vivo, toggle idioma PT/EN, botão de carrinho com contador e acesso ao perfil. |
| `Catalog` | Grade de produtos com filtro em tempo real por busca e categoria. |
| `Product` | Card de produto com preço, categoria, imagem e ação de adicionar ao carrinho. |
| `ProductDetails` | Página de detalhes: imagem, descrição, fabricante/linha/modelo, seleção de quantidade. |
| `Cart` | Carrinho com atualização de quantity via API e remoção de itens. |
| `CheckoutButton` | Cria pedido em `/api/orders` com `Idempotency-Key` e encaminha para `/payments`. |
| `PaymentsPage` | Tela de pagamentos: crédito, débito, PIX, boleto e split payment (2 métodos). |
| `PaymentMethodSelector` | Seletor visual de método de pagamento (chips/radios). |
| `CardBrandChips` | Detecção de bandeira do cartão (Visa, MasterCard, Amex, Elo etc). |
| `ThankYouPage` | Confirmação do pedido, resumo de itens e dados mock de PIX/Boleto (copiar/download). |
| `Login` | Formulário de autenticação com show/hide de senha. |
| `Register` | Formulário multistep (Stepper MUI): dados pessoais → endereço. Com validação de CPF, CNPJ, CEP (ViaCEP API) e indicador de força de senha. |
| `AdminHomePage` | Entrada administrativa dentro de `/minha-conta/admin` para operações sensíveis. |
| `AdminProductsPage` | Gestão de produtos com exclusão permanente restrita a admin. |
| `AdminUsersPage` | Gestão de usuários com exclusão permanente restrita a admin. |

---

## 🌐 Internacionalização (i18n)

- Implementada via `LanguageContext` em `src/contexts/LanguageContext.jsx`.
- Dicionários PT/EN cobrem todos os textos da UI: NavBar, Catálogo, Carrinho, Detalhes, Checkout, Payments, Thank You e mensagens Toast.
- Preferência persistida no `localStorage`.

---

## ⚙️ Como Rodar a Aplicação

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) 18.x ou superior.
- [Docker](https://www.docker.com/) e Docker Compose instalados.

### 2. Inicializar o Banco de Dados (Docker)
Na raiz do projeto:
```bash
docker compose up -d
# Container "ecommerce_db" sobe na porta 5432
```

### 3. Configurar e Semear o Backend
```bash
cd server
npm install
npm run seed  # Cria tabelas + insere os 10 produtos iniciais
npm run dev   # API REST disponível em http://localhost:3001
```

### 4. Iniciar o Frontend
```bash
# Na raiz do projeto (outra aba/terminal)
npm install
npm run dev
# Acesse: http://localhost:5173
```
> O proxy do Vite encaminha automaticamente `/api/*` → `http://localhost:3001`.

### 5. Build de Produção
```bash
# Backend
cd server && npm run build && npm run start

# Frontend
cd .. && npm run build && npm run preview
```

---

## 📁 Estrutura de Pastas

```text
amazonQA.com/
├── docker-compose.yml         # Serviço PostgreSQL 16-alpine
├── package.json               # Frontend (React + Vite)
├── vite.config.js             # Proxy /api → :3001
│
├── server/                    # Backend Next.js
│   ├── .env.local             # DATABASE_URL
│   ├── package.json           # next, pg, dotenv
│   ├── next.config.js
│   ├── lib/
│   │   └── db.js              # pg.Pool singleton + type parser
│   ├── scripts/
│   │   └── seed.js            # DDL + seed de produtos
│   └── app/api/
│       ├── products/
│       │   ├── route.js       # GET /products | POST /products
│       │   └── [id]/route.js  # GET/PUT/DELETE /products/:id
│       ├── users/
│       │   ├── register/route.js
│       │   └── login/route.js
│       ├── orders/
│       │   ├── route.js                     # GET/POST /orders
│       │   └── [id]/
│       │       ├── route.js                 # GET/PUT/DELETE /orders/:id
│       │       ├── payments/route.js        # POST /orders/:id/payments
│       │       ├── payments/[paymentId]/route.js # GET /orders/:id/payments/:paymentId
│       │       └── boleto/[reference]/route.js   # GET /orders/:id/boleto/:reference (PDF)
│       └── cart/
│           └── route.js       # GET/POST/DELETE /cart
│
└── src/                       # Frontend React
    ├── components/            # Catalog, Cart, CheckoutButton, PaymentsPage, ThankYouPage etc.
    │   └── payment/           # PaymentMethodSelector, CardBrandChips
    ├── contexts/
    │   ├── AuthContext.jsx
    │   ├── DatabaseContext.jsx
    │   └── LanguageContext.jsx
    ├── data/
    │   └── products_mock.json # Fonte de dados para o seed
    ├── db/
    │   └── api.js             # Fetch client REST (espelha as assinaturas do banco antigo)
    ├── App.jsx
    └── main.jsx
```

---

## 📜 Dependências Principais

| Pacote | Camada | Função |
|---|---|---|
| `react` + `react-dom` | Frontend | Core da UI |
| `react-router-dom` | Frontend | Roteamento SPA |
| `@mui/material` + `@mui/icons-material` | Frontend | Design System |
| `react-toastify` | Frontend | Notificações toast |
| `vite` + `@vitejs/plugin-react` | Frontend | Build tool & dev server |
| `next` | Backend | Framework de API (App Router) |
| `pg` (node-postgres) | Backend | Driver PostgreSQL |
| `dotenv` | Backend | Carregamento de variáveis de ambiente |

---

## 🔐 Nota de Segurança

> ✅ As senhas são processadas e armazenadas de forma segura no banco de dados utilizando hashing com o **bcrypt** (salt rounds = 12), em aderência às boas práticas de segurança do mercado de software (OWASP).
