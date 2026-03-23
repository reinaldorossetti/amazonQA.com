# Gestão de Usuários do Sistema (Backend)

## Objetivo

Implementar gerenciamento completo de usuários com autorização por perfil administrativo, encerramento de conta com ofuscação e exclusão definitiva restrita a administrador.

## Regras aplicadas

1. Alterações no banco foram **somente aditivas**.
2. Encerramento de conta ofusca dados pessoais e preserva informações mínimas.
3. Exclusão definitiva (`hard delete`) é permitida apenas para `admin`.
4. Contrato base mantido em `/api/users`.

## Entregas implementadas

### Endpoints

| Funcionalidade | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar usuários cadastrados | GET | `/api/users` | Admin |
| Cadastrar novo usuário | POST | `/api/users` | Admin |
| Buscar usuário por ID | GET | `/api/users/{id}` | Próprio usuário ou Admin |
| Editar usuário existente | PUT | `/api/users/{id}` | Próprio usuário ou Admin |
| Excluir usuário por ID | DELETE | `/api/users/{id}` | Admin |
| Encerrar conta com ofuscação | POST | `/api/users/{id}/terminate` | Próprio usuário ou Admin |
| Cadastro legado (mantido) | POST | `/api/users/register` | Público |
| Login legado (mantido) | POST | `/api/users/login` | Público |

### Banco de dados (aditivo)

#### `users`

- `updated_at TIMESTAMPTZ`
- `is_active BOOLEAN NOT NULL DEFAULT true`
- `account_closed_at TIMESTAMPTZ`

#### `user_roles` (nova tabela)

- `id SERIAL PRIMARY KEY`
- `user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `role TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `UNIQUE (user_id, role)`

Perfis garantidos no seed para ambiente de testes:

- perfil `user`
- perfil `admin`

> Observação: o seed promove para `admin` o usuário definido em `SEED_ADMIN_EMAIL`; se não houver, usa o primeiro usuário cadastrado.

## Política de encerramento implementada

No endpoint `POST /api/users/{id}/terminate`:

- mantém: `created_at`, `account_closed_at`, `first_name` e transações associadas;
- ofusca/limpa: `email`, `last_name`, `phone`, `cpf`, `cnpj`, dados de endereço e comprovantes;
- desativa acesso: `is_active = false`;
- invalida login prático ao trocar hash de senha por valor aleatório.

## Política de exclusão definitiva

- Endpoint: `DELETE /api/users/{id}`
- Requer papel `admin` (tabela `user_roles`).
- Remove o usuário permanentemente.

## Arquivos alterados

- `server/scripts/seed.js`
- `server/app/api/users/register/route.js`
- `server/app/api/users/login/route.js`
- `server/lib/user-roles.js` (novo)
- `server/app/api/users/route.js` (novo)
- `server/app/api/users/[id]/route.js` (novo)
- `server/app/api/users/[id]/terminate/route.js` (novo)
- `.env` (novo placeholder no root)

## Validação executada

### Build backend

- `server`: `npm run build` ✅
- Rotas novas compiladas com sucesso:
  - `/api/users`
  - `/api/users/[id]`
  - `/api/users/[id]/terminate`

### Seed/migração aditiva

- `server`: `npm run seed` ✅
- Tabelas e alterações aplicadas sem erro.

### Testes existentes no frontend

- `root`: `npm run test:unit` ❌
- Falha em 15 suítes com erro comum: `Cannot read properties of undefined (reading 'config')`.
- Esse erro ocorreu em testes de frontend e não está diretamente relacionado às rotas backend implementadas.

## Próximos passos recomendados

1. Criar suíte de testes backend para os novos endpoints de usuários (auth, ownership e admin).
2. Corrigir configuração dos testes frontend (`vitest`) para remover erro global de `config`.
3. Definir processo de promoção de usuário para `admin` (script SQL ou endpoint administrativo dedicado).