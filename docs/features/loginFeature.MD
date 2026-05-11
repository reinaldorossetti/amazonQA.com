## Login — Testes BDD

### Dados de teste (do código)
- **Seed backend (server-ts)**: `server-ts/scripts/seed.ts`
	- Admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (default: `reiload@gmail.com` / `rei2026@QA`)
	- User: `SEED_NORMAL_EMAIL` / `SEED_NORMAL_PASSWORD` (default: `reinaldo.rossetti@outlook.com` / `qualidade2026@QA`)
	- Support: `SEED_SUPPORT_EMAIL` / `SEED_SUPPORT_PASSWORD` (default: `suporte@tester.com` / `suporte2026@QA`)

- **Fixture Web E2E**: `web/e2e/fixtures/login.fixture.ts`
	- Email válido: `usuario@teste.com`
	- Senha válida: `Senha@123`
	- Senha inválida: `SenhaErrada@999`

### Funcionalidade: Login via API (Backend)
**Endpoint:** `POST /api/users/login` (OpenAPI `docs/swagger/openapi.yaml`)

### Funcionalidade: Login via Web (Frontend)
**Página:** `http://127.0.0.1:5174/login`

**Contexto:**
- Dado que a página de login exibe os campos "E-mail" e "Senha"
- E existe o botão "Entrar" e o link "Criar sua conta"
- E o backend está acessível para autenticação

**Esquema do Cenário: Login com sucesso para perfis diferentes**
- Dado que o usuário "<perfil>" existe e possui credenciais válidas
- Quando eu acesso `/login`
- E preencho o campo "E-mail" com "<email>"
- E preencho o campo "Senha" com "<password>"
- E clico em "Entrar"
- Então devo ver o toast "Bem-vindo(a) de volta"
- E devo ser redirecionado para `/minha-conta` (ou para o `next` informado na URL)

**Exemplos:**
| perfil  | email                          | password          |
|---------|--------------------------------|-------------------|
| admin   | reiload@gmail.com              | rei2026@QA        |
| user    | reinaldo.rossetti@outlook.com  | qualidade2026@QA  |
| support | suporte@tester.com             | suporte2026@QA    |

**Cenário: Campos obrigatórios vazios**
- Quando eu acesso `/login`
- E tento entrar sem preencher "E-mail" e "Senha"
- Então devo ver o alerta de erro "Preencha e-mail e senha."
- E devo permanecer na página de login

**Cenário: Senha inválida**
- Dado que existe um usuário válido
- Quando eu acesso `/login`
- E preencho "E-mail" com `usuario@teste.com`
- E preencho "Senha" com `SenhaErrada@999`
- E clico em "Entrar"
- Então devo ver o alerta de erro indicando **credenciais inválidas**
- E devo permanecer na página de login

**Cenário: Backend retorna 403 (conta inativa/encerrada)**
- Dado que o backend responde **403** para as credenciais informadas
- Quando eu tento fazer login
- Então devo ver o alerta de erro com a mensagem do backend
- E devo permanecer na página de login
