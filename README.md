# 🛒 AmazonQA — Loja Online

Aplicação de e-commerce completa construída com **React + Vite** no frontend e **Next.js + PostgreSQL** no backend, com design visual inspirado na Amazon. Inclui catálogo de produtos, sistema de login/cadastro de usuários, gestão de carrinho e internacionalização PT/EN.

Pirâmide de Testes do Projeto:

Unitários/Unidade:  
https://reinaldorossetti.github.io/tester.com/unit-tests/  

API Testes:  
https://reinaldorossetti.github.io/tester.com/api-tests/  

E2E Testes:  
https://reinaldorossetti.github.io/tester.com/playwright-reports/  

---

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
       created_at TIMESTAMPTZ)

-- Carrinho (relaciona users ↔ products)
cart_items (id SERIAL PK,
            user_id  → users.id    ON DELETE CASCADE,
            product_id → products.id ON DELETE CASCADE,
            quantity DEFAULT 1,
            added_at TIMESTAMPTZ,
            UNIQUE (user_id, product_id))
```

### Arquivos de Infraestrutura

| Arquivo | Responsabilidade |
|---|---|
| `docker-compose.yml` | Container `postgres:16-alpine`, porta `5432`, volume `postgres_data`. |
| `server/.env.local` | `DATABASE_URL=postgresql://ecommerce_user:ecommerce_pass@localhost:5432/ecommerce` |
| `server/lib/db.js` | Singleton `pg.Pool` com *type parser* de `NUMERIC → float`. |
| `server/scripts/seed.js` | DDL idempotente (`IF NOT EXISTS`) + seed de produtos. |
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
Cria um novo produto.

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

---

#### `PUT /api/products/:id`
Atualiza um produto existente. Aceita os mesmos campos do `POST`.

**Resposta 200:** Objeto produto atualizado.
**Resposta 404:** `{ "error": "Produto não encontrado" }`

---

#### `DELETE /api/products/:id`
Remove um produto pelo ID.

**Resposta 200:** `{ "message": "Produto removido" }`
**Resposta 404:** `{ "error": "Produto não encontrado" }`

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
  "userId": 1,
  "productId": 5,
  "quantity": 1
}
```

**Resposta 201:** Objeto `cart_items` com o registro upsertado.
**Resposta 400:** Se `userId` ou `productId` estiverem ausentes.

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

## 🧩 Componentes do Frontend

| Componente | Descrição |
|---|---|
| `NavBar` | Logo, busca ao vivo, toggle idioma PT/EN, botão de carrinho com contador e acesso ao perfil. |
| `Catalog` | Grade de produtos com filtro em tempo real por busca e categoria. |
| `Product` | Card de produto com preço, categoria, imagem e ação de adicionar ao carrinho. |
| `ProductDetails` | Página de detalhes: imagem, descrição, fabricante/linha/modelo, seleção de quantidade. |
| `Cart` | Carrinho com atualização de quantity via API e remoção de itens. |
| `Login` | Formulário de autenticação com show/hide de senha. |
| `Register` | Formulário multistep (Stepper MUI): dados pessoais → endereço. Com validação de CPF, CNPJ, CEP (ViaCEP API) e indicador de força de senha. |

---

## 🌐 Internacionalização (i18n)

- Implementada via `LanguageContext` em `src/contexts/LanguageContext.jsx`.
- Dicionários PT/EN cobrem todos os textos da UI: NavBar, Catálogo, Carrinho, Detalhes, Checkout e mensagens Toast.
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
tester.com/
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
│       └── cart/
│           └── route.js       # GET/POST/DELETE /cart
│
└── src/                       # Frontend React
    ├── components/            # Catalog, Product, Cart, Login, Register, ProductDetails
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
