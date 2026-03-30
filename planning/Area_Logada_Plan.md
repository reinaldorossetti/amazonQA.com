# Plano de Implementação — Área Logada (inspirado na Amazon)

## Objetivo
Criar uma **área logada** para usuários autenticados, seguindo a arquitetura atual do projeto (`React + Vite` no frontend, `Next.js + PostgreSQL` no backend), com os seguintes recursos:

- Tela para consultar **pedido/compra** (lista + detalhes).
- **Menu da Conta/Compras (minha-conta)** com atalhos relevantes, como "Meus Pedidos", "Meu Perfil", "Carrinho", "Continuar comprando" e "Sair".
- Tela para visualizar **dados do usuário** e consultar/editar **dados de endereço**.
- Redirecionamento automático para a área logada após login.

> Restrição: **não alterar** as telas já existentes (catálogo, produto, carrinho, pagamentos, obrigado, cadastro).

---

## Escopo Funcional

### 1) Redirecionamento pós-login
- Ao autenticar com sucesso:
  - Se existir `?next=...`, manter comportamento atual.
  - Se não existir `next`, redirecionar para `/minha-conta`.

### 2) Área logada
Criar uma seção protegida com rotas:
- `/minha-conta` → resumo da conta (dashboard)
- `/minha-conta/dados` → dados do usuário
- `/minha-conta/endereco` → consulta e edição de endereço
- `/minha-conta/pedidos` → lista de pedidos
- `/minha-conta/pedidos/:id` → detalhe de pedido

### 3) Menu da Conta/Compras
Itens sugeridos dentro da área logada:
- **Meus Pedidos** → `/minha-conta/pedidos`
- **Meu Perfil** → `/minha-conta/dados`
- **Meu Endereço** → `/minha-conta/endereco`
- **Carrinho** → `/cart`
- **Continuar comprando** → `/`
- **Sair** → ação de logout

---

## Arquitetura e Organização (frontend)

### Novos componentes
Criar pasta:
- `src/components/account/`

Arquivos propostos:
- `AccountLayout.jsx` — layout base da área logada (menu + conteúdo)
- `AccountHome.jsx` — dashboard da conta com atalhos
- `UserProfilePage.jsx` — visualização dos dados do usuário
- `UserAddressPage.jsx` — edição de endereço com validação
- `OrdersPage.jsx` — listagem de pedidos
- `OrderDetailsPage.jsx` — detalhe do pedido

### Integração com rotas existentes
Arquivo:
- `src/App.jsx`

Ações:
- Adicionar novas rotas da área logada.
- Envolver as rotas novas com `ProtectedRoute`.
- Manter rotas existentes intactas.

### Ajuste de login
Arquivo:
- `src/components/Login.jsx`

Ação:
- Alterar fallback de `nextPath` para `/minha-conta`.

---

## Backend/API necessário

### Endpoints para conta
Criar/ajustar endpoints autenticados:
- `GET /api/users/me` → retorna dados do usuário autenticado
- `PUT /api/users/me/address` → atualiza endereço do usuário autenticado

### Endpoints de pedidos
Reaproveitar e/ou ajustar:
- `GET /api/orders` → lista de pedidos do usuário (paginável)
- `GET /api/orders/:id` → detalhe completo do pedido

### Cliente API frontend
Arquivo:
- `src/db/api.js`

Adicionar funções:
- `getMe()`
- `updateMyAddress(payload)`
- `getMyOrders(params?)`
- `getMyOrderById(id)`

---

## Modelo de dados esperado

### Dados do usuário (mínimo)
- `id`
- `first_name`
- `last_name`
- `email`
- `person_type`

### Endereço (mínimo)
- `address_zip`
- `address_street`
- `address_number`
- `address_complement`
- `address_neighborhood`
- `address_city`
- `address_state`

### Pedido (mínimo)
- `id`
- `order_number`
- `status`
- `grand_total`
- `created_at`
- `items[]` (no detalhe)

---

## Critérios de aceite (DoD)
- [ ] Login sem `next` redireciona para `/minha-conta`.
- [ ] Usuário não autenticado não acessa rotas `/minha-conta/*`.
- [ ] Usuário visualiza seus dados em `/minha-conta/dados`.
- [ ] Usuário visualiza e edita endereço em `/minha-conta/endereco`.
- [ ] Usuário visualiza lista de pedidos em `/minha-conta/pedidos`.
- [ ] Usuário visualiza detalhe de pedido em `/minha-conta/pedidos/:id`.
- [ ] Menu da Conta/Compras funcional na área logada.
- [ ] Nenhuma regressão nas telas já existentes.

---

## Plano de execução (incremental)

### Fase 1 — Estrutura e navegação
1. Criar componentes base da área logada (`AccountLayout`, `AccountHome`).
2. Registrar rotas protegidas em `App.jsx`.
3. Ajustar redirect padrão no `Login.jsx`.

### Fase 2 — Dados do usuário e endereço
1. Expor endpoints `GET /api/users/me` e `PUT /api/users/me/address`.
2. Criar funções no `src/db/api.js`.
3. Implementar `UserProfilePage` e `UserAddressPage`.

### Fase 3 — Pedidos/Compras
1. Validar resposta de `GET /api/orders` e `GET /api/orders/:id` para o frontend.
2. Implementar `OrdersPage` e `OrderDetailsPage`.
3. Integrar menu de compras e navegação interna.

### Fase 4 — Qualidade
1. Testes unitários dos componentes da área logada.
2. Teste E2E do fluxo: login → área logada → editar endereço → ver pedido.
3. Verificação de regressão nas telas existentes.

> Observação: criar novos testes para a área logada; não é necessário alterar os testes existentes.
---

## Riscos e mitigação
- **Risco:** inconsistência entre contrato de API e frontend.
  - **Mitigação:** definir payloads mínimos e validar responses antes da UI final.
- **Risco:** regressão em fluxo de login.
  - **Mitigação:** manter `next` com prioridade e alterar apenas fallback.
- **Risco:** experiência visual inconsistente.
  - **Mitigação:** reutilizar tema e componentes MUI já existentes no projeto.

---

## Observações finais
- O plano foi desenhado para **adicionar** a área logada sem substituir páginas atuais.
- O comportamento atual de autenticação e `ProtectedRoute` será reaproveitado.
- A proposta mantém o estilo visual inspirado na Amazon e respeita a arquitetura existente.
