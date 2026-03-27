# Prompt de Implementação — Endpoint de Orders (Checkout estilo Amazon)

## Contexto
Você está trabalhando no backend do projeto `tester.com`, localizado em `server/`, com stack:
- Next.js 14 (App Router)
- PostgreSQL com `pg`
- Autenticação JWT via `server/lib/auth.js`
- Acesso ao banco via `server/lib/db.js`

Atualmente já existem recursos para:
- Produtos (`/api/products`)
- Usuários (`/api/users`)
- Carrinho (`/api/cart`)

Não existe recurso completo de `orders` implementado no backend.

---

## Objetivo
Implementar o recurso **Order** representando a confirmação de compra do carrinho, semelhante ao fluxo da Amazon quando o usuário conclui o checkout.

> Definição: *An order is a customer's request to purchase one or more products from a shop. You can create, retrieve, update, and delete orders using the Order resource.*

---

## Requisitos Funcionais
1. Criar pedido a partir do carrinho do usuário autenticado.
2. Listar pedidos do usuário autenticado.
3. Buscar pedido por ID (somente dono do pedido ou admin).
4. Atualizar pedido (com regras de campos permitidos e status).
5. Excluir pedido (ou cancelar logicamente, preferencialmente).
6. Limpar carrinho após criação bem-sucedida do pedido.
7. Preservar snapshot dos itens/preços no momento da compra.

---

## Endpoints a Implementar
### 1) `POST /api/orders`
Cria um novo pedido com base nos itens do carrinho do usuário autenticado.

**Regras**:
- Exige Bearer Token válido.
- Falha com `400` se carrinho estiver vazio.
- Usa transação SQL:
  1. Criar `orders`
  2. Criar `order_items`
  3. Calcular totais
  4. Limpar itens do carrinho
  5. `COMMIT`
- Em erro, executar `ROLLBACK`.

**Resposta esperada (`201`)**:
- `id`
- `orderNumber`
- `status`
- `items`
- `subtotal`, `shippingTotal`, `discountTotal`, `grandTotal`
- `createdAt`

### 2) `GET /api/orders`
Lista pedidos do usuário autenticado.

**Regras**:
- Usuário comum vê apenas os próprios pedidos.
- Admin pode listar todos (com filtros opcionais por usuário/status).

### 3) `GET /api/orders/{id}`
Retorna detalhes de um pedido específico.

**Regras**:
- Apenas dono do pedido ou admin.
- `404` se não encontrado.
- `403` se sem permissão.

### 4) `PUT /api/orders/{id}`
Atualiza dados permitidos do pedido.

**Recomendação**:
- Permitir alterações controladas por status (ex.: admin altera workflow logístico).
- Bloquear alteração de itens e preços após criação.

### 5) `DELETE /api/orders/{id}`
Exclusão/cancelamento de pedido.

**Recomendação de negócio**:
- Priorizar cancelamento lógico em vez de hard delete.
- Restringir hard delete para admin e/ou status específicos.

---

## Modelo de Dados Proposto
### Tabela `orders`
- `id` (PK)
- `order_number` (único)
- `user_id` (FK users)
- `status` (created, paid, processing, shipped, delivered, cancelled)
- `subtotal` (numeric)
- `shipping_total` (numeric, default 0)
- `discount_total` (numeric, default 0)
- `grand_total` (numeric)
- `currency` (default `BRL`)
- `payment_method` (nullable)
- `created_at`
- `updated_at`
- `cancelled_at` (nullable)

### Tabela `order_items`
- `id` (PK)
- `order_id` (FK orders ON DELETE CASCADE)
- `product_id` (FK products)
- `product_name_snapshot`
- `unit_price_snapshot`
- `quantity`
- `line_total`

---

## Requisitos Técnicos
1. Seguir padrão de rotas existente em `server/app/api/**`.
2. Reaproveitar `authenticateRequest` e checagens de autorização.
3. Implementar SQL parametrizado (sem concatenação insegura).
4. Aplicar mudanças aditivas de banco no fluxo de seed/migração atual.
5. Atualizar `docs/swagger/openapi.yaml` com schemas e endpoints de Orders.
6. Manter estilo de resposta e erros consistente com APIs existentes.

---

## Estrutura Esperada de Arquivos
- `server/app/api/orders/route.js`
- `server/app/api/orders/[id]/route.js`
- (Opcional recomendado) `server/app/api/orders/[id]/cancel/route.js`
- Atualizações em `server/scripts/seed.js` (criação de tabelas)
- Atualizações em `docs/swagger/openapi.yaml`

---

## Critérios de Aceite
- [ ] Criar pedido com carrinho válido retorna `201`.
- [ ] Criar pedido com carrinho vazio retorna `400`.
- [ ] Usuário sem token recebe `401`.
- [ ] Usuário não pode acessar pedido de outro (`403`).
- [ ] Admin pode consultar pedidos de qualquer usuário.
- [ ] Pedido persiste snapshot de item/preço.
- [ ] Carrinho é limpo após pedido criado com sucesso.
- [ ] OpenAPI atualizado com contratos de Orders.

---

## Testes Recomendados
### Unitários / Integração API
1. `POST /api/orders` com sucesso.
2. `POST /api/orders` com carrinho vazio.
3. `GET /api/orders` filtrando por usuário.
4. `GET /api/orders/{id}` com owner e com não-owner.
5. `PUT /api/orders/{id}` respeitando regras de status.
6. `DELETE /api/orders/{id}` conforme política definida.
7. Caso de rollback em falha intermediária de transação.

---

## Observações de Implementação
- Gerar `order_number` legível e único (ex.: `ORD-YYYYMMDD-XXXXXX`).
- Considerar idempotência para evitar pedidos duplicados em reenvio de requisição.
- Em produção, separar claramente fase de `checkout` da fase de `payment confirmation`.

---

## Resultado Esperado
Um recurso completo de `orders` com CRUD seguro, integração com carrinho, documentação OpenAPI e base pronta para expansão futura (pagamento, rastreio e logística).
- Documentação clara e atualizada.
- Código limpo, modular e seguindo padrões do projeto.
- Idempotência no Checkout (POST /api/orders)
O problema: Se a internet piscar no momento em que o usuário confirma o carrinho, ele pode enviar a requisição duas vezes e gerar dois pedidos (e possivelmente duas cobranças).
A melhoria: Exigir (ou suportar) um header Idempotency-Key no POST /api/orders. O backend cadastra essa chave atrelada ao pedido. Se a mesma chave chegar de novo, o backend apenas devolve o pedido já criado em vez de duplicá-lo.

- Validação de Preços "Source of Truth"
O problema: Um erro comum em fluxos de checkout é confiar 100% no carrinho ou em envios do frontend.
A melhoria: Deixar explícito no plano que, durante a transação do POST, o backend deve ler o preço atual do produto na tabela products, e não aceitar o preço do cart_items ou do payload como verdade absoluta. O cálculo de subtotal e grand_total deve ser construído iterando pelos produtos recém-buscados no banco.