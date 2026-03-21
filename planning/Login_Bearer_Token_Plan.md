# Plano de Implementação — Login com Bearer Token

## Objetivo
Ao efetuar login na aplicação, gerar um Bearer Token para permitir acesso seguro às áreas autenticadas.

## Escopo
- Backend (Next.js API): geração e validação de token JWT.
- Frontend (React): armazenamento da sessão autenticada e envio do token nas requisições protegidas.
- Testes (API + fluxo autenticado): validação funcional e de segurança básica.

---

## 1) Arquitetura de autenticação

### Estratégia
- Usar **JWT** como Bearer Token.
- No login bem-sucedido, retornar:
  - `accessToken`
  - `tokenType: "Bearer"`
  - `expiresIn`
  - `user` (sem senha)

### Formato de uso
- Header nas rotas protegidas:
  - `Authorization: Bearer <token>`

### Claims sugeridas no token
- `sub` (id do usuário)
- `email`
- `personType`
- `iss` (issuer)
- `aud` (audience)
- `iat` e `exp`

---

## 2) Mudanças no backend

### 2.1 Login: geração de token
Arquivo alvo:
- `server/app/api/users/login/route.js`

Mudanças:
1. Após validar email/senha, gerar JWT.
2. Retornar payload de autenticação com token.
3. Continuar removendo senha dos dados retornados.

### 2.2 Utilitário de autenticação
Arquivo novo sugerido:
- `server/lib/auth.js`

Responsabilidades:
- `signAccessToken(user)`
- `verifyAccessToken(token)`
- Validação de claims padrão (`iss`, `aud`, `exp`)

### 2.3 Proteção de rotas privadas
Aplicar verificação de token nas rotas que exigem autenticação:
- Carrinho de usuário autenticado
- Checkout / pedido
- Demais endpoints de área logada

Comportamento esperado:
- Sem token ou token inválido/expirado → `401 Unauthorized`

---

## 3) Mudanças no frontend

### 3.1 Contexto de autenticação
Arquivo alvo:
- `src/contexts/AuthContext.jsx`

Mudanças:
1. Persistir `accessToken` junto com `user`.
2. Ajustar `isLoggedIn` para refletir sessão com token.
3. Em `logout`, limpar token + usuário.
4. Restaurar sessão no carregamento inicial.

### 3.2 Cliente HTTP
Arquivo alvo:
- `src/db/api.js`

Mudanças:
1. Incluir `Authorization: Bearer ...` automaticamente quando houver token.
2. Em resposta `401`, limpar sessão e redirecionar para login.

### 3.3 Fluxo de login
Arquivo alvo:
- `src/components/Login.jsx`

Mudanças:
1. Consumir `accessToken` retornado pelo backend.
2. Persistir no `AuthContext`.
3. Manter redirecionamento via `?next=...`.

---

## 4) Configuração de ambiente

Arquivo criado:
- `server/.env`

Variáveis:
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `JWT_AUDIENCE`

> Observação: trocar o placeholder por segredo forte antes de produção.

---

## 5) Plano de testes

## 5.1 Testes de API (autenticação)
Arquivo base existente:
- `e2e/specs/api/users.api.spec.ts`

Casos:
1. Login válido retorna `accessToken` e `user` sem senha.
2. Login inválido retorna `401`.
3. Payload incompleto retorna `400`.
4. Rota protegida sem token retorna `401`.
5. Rota protegida com token válido retorna `200`.
6. Token expirado retorna `401`.

## 5.2 Testes E2E (área logada)
Casos sugeridos:
1. Usuário não autenticado tenta acessar rota protegida e é redirecionado para `/login`.
2. Após login, usuário retorna para rota original (`next`).
3. Logout bloqueia novamente acesso a rotas protegidas.

---

## 6) Critérios de aceite
- Login gera Bearer Token válido.
- Rotas privadas exigem `Authorization` válido.
- Frontend mantém sessão autenticada e remove sessão em `401`/logout.
- Testes de autenticação e acesso protegido passando.

---

## 7) Riscos e mitigação
- **Risco:** token em `localStorage` ser alvo de XSS.
  - **Mitigação:** sanitização, CSP e evolução para refresh token em cookie `HttpOnly`.
- **Risco:** expiração interromper UX.
  - **Mitigação:** feedback claro e redirecionamento com preservação de `next`.

---

## 8) Evolução recomendada (fase 2)
- Implementar **refresh token** em cookie `HttpOnly`.
- Rotação de chave JWT e revogação de sessão.
- Auditoria de login e tentativas inválidas.
