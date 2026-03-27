# 💳 Plano de Implementação — Tela de Payments/Pagamentos

## Objetivo

Implementar a etapa de pagamento no fluxo de compra, com experiência inspirada em marketplaces (Amazon/Mercado Livre), adicionando métodos de pagamento comuns do Brasil:

- Cartão de **crédito**
- Cartão de **débito**
- **PIX**
- **Boleto**

Com suporte visual para bandeiras relevantes do Brasil e amplamente aceitas no e-commerce.

---

## Escopo Funcional (MVP)

### 1) Novo passo no checkout

Fluxo alvo:

`/cart` → criação de pedido (`POST /api/orders`) → `/payments` → confirmação de pagamento → `/thank-you`

### 2) Seleção de método de pagamento

O usuário deve escolher 1 ou 2 métodos de pagamentos disponíveis (simulados), ele pode habilitar dois métodos de pagamento combinados (ex: parte no crédito + parte no PIX) ou apenas um método para o valor total, deixe um método por padrão, usuário deve selecionar a opção dois manualmente.

- Crédito
- Débito
- PIX
- Boleto

### 3) Bandeiras e meios aceitos (exibição)

Exibir badges/logo-texto das bandeiras (MVP visual):

- **Visa**
- **Mastercard**
- **Elo**
- **American Express**
- **Hipercard**
- **Hiper**
- **Cabal**
- **VerdeCard**
- **UnionPay**
- **Diners Club**

> Observação: no MVP, a validação de aceitação real por bandeira pode ser simulada por regra local. Em integração com gateway, a autorização real passa a ser do provedor.

### 4) Estados de pagamento

- `authorized` (aprovado)
- `pending` (aguardando: PIX/Boleto)
- `failed` (negado/erro)

---

## Requisitos de UX/UI (template-style Amazon)

## Layout

- Desktop: 2 colunas
  - Esquerda: métodos + formulário
  - Direita (sticky): resumo do pedido
- Mobile: 1 coluna, resumo abaixo ou em accordion

## Componentes visuais

- Cabeçalho com progresso de checkout
- Seletor de método em cards/radios
- Bloco de segurança: “Pagamento seguro”
- CTA principal dinâmico por método:
  - Crédito/Débito: `Pagar agora`
  - PIX: `Gerar QR Code`
  - Boleto: `Gerar boleto`

## Comportamentos

- Validação em tempo real de campos
- Máscaras para cartão, validade, CVV
- Mensagens claras de erro/sucesso
- Estado de loading e prevenção de duplo clique

---

## Arquitetura Técnica

## Frontend (React)

### Arquivos novos (propostos)

- `src/components/PaymentsPage.jsx`
- `src/components/payment/PaymentMethodSelector.jsx`
- `src/components/payment/CreditCardForm.jsx`
- `src/components/payment/DebitCardForm.jsx`
- `src/components/payment/PixPanel.jsx`
- `src/components/payment/BoletoPanel.jsx`
- `src/components/payment/CardBrandChips.jsx`

### Arquivos existentes a alterar

- `src/App.jsx`
  - adicionar rota protegida `"/payments"`
- `src/components/CheckoutButton.jsx`
  - redirecionar para `"/payments"` após criar pedido
- `src/contexts/LanguageContext.jsx`
  - adicionar chaves i18n da tela de pagamentos
- `src/db/api.js`
  - cliente para endpoint de pagamento

## Backend (Next.js API)

### Endpoints propostos

- `POST /api/orders/:id/payments`
  - cria tentativa de pagamento
- `GET /api/orders/:id/payments/:paymentId`
  - consulta status (especialmente útil para PIX/Boleto)

### Estrutura de resposta (sugestão)

- `paymentId`
- `status` (`authorized | pending | failed`)
- `method`
- `nextAction` (`show_pix_qr`, `show_boleto`, `none`)
- `metadata` (dados não sensíveis por método)

### Banco de dados (fase recomendada)

Tabela `payments`:

- `id`
- `order_id`
- `method`
- `amount`
- `status`
- `provider_reference`
- `metadata` (JSON)
- `created_at`
- `updated_at`

---

## Regras de Negócio por Método

## Crédito

- Campos: nome, número, validade, CVV, parcelas
- Validações:
  - número com Luhn
  - validade futura
  - CVV 3-4 dígitos
- Resultado esperado: `authorized` ou `failed`

## Débito

- Campos semelhantes ao crédito (MVP)
- Pode usar fluxo simplificado sem 3DS no mock
- Resultado esperado: `authorized` ou `failed`

## PIX

- Gerar payload com:
  - `qrCode` (imagem/base64 mock)
  - `copyPasteCode`
  - `expiresAt`
- Resultado inicial: `pending`
- Permitir ação: “Atualizar status”

## Boleto

- Gerar:
  - linha digitável
  - vencimento
  - link de download mock
- Resultado inicial: `pending`

---

## Segurança e Compliance

- Não persistir CVV
- Não logar PAN completo (somente masked)
- Validar ownership do pedido autenticado
- Idempotência por tentativa de pagamento
- Rate limit para evitar abuso
- Valor pago sempre validado pelo backend contra `order.grand_total`

---

## Observabilidade e Diagnóstico

- Correlation id por request
- Log estruturado por evento de pagamento
- Métricas mínimas:
  - tentativas por método
  - taxa de aprovação
  - taxa de erro
  - tempo médio de autorização

---

## Plano de Testes

## Unit (Vitest + RTL)

- Render da página de pagamento
- Troca de método e render condicional
- Validações de crédito/débito
- Fluxo de geração PIX
- Fluxo de geração boleto
- Estados de erro e loading

## E2E Frontend (Playwright)

- Usuário logado completa pagamento com crédito e vai para `/thank-you`
- PIX gera QR e status `pending`
- Boleto gera linha digitável e instruções
- Usuário não autenticado redireciona para login com `next`

## API (Playwright/Vitest server)

- `POST /api/orders/:id/payments` por método
- Falha com payload inválido
- Falha sem autenticação
- Falha sem ownership do pedido
- Consulta de status via `GET /api/orders/:id/payments/:paymentId`

---

## Critérios de Aceite

- [ ] Rota `/payments` protegida e funcional
- [ ] 4 métodos de pagamento disponíveis e navegáveis
- [ ] Crédito e débito com validação básica client-side
- [ ] PIX com QR/copia-e-cola + expiração
- [ ] Boleto com linha digitável + vencimento
- [ ] Integração com pedido existente (`order.id`)
- [ ] Redirecionamento correto para `/thank-you` no sucesso
- [ ] Casos de erro exibidos com mensagens claras
- [ ] Testes unitários e E2E cobrindo fluxo principal

---

## Planejamento por Fases

### Fase 1 — Estrutura e UI base

- Criar rota `/payments`
- Implementar layout e seletor de método
- Implementar resumo do pedido

### Fase 2 — Lógicas por método

- Implementar formulários crédito/débito
- Implementar painel PIX
- Implementar painel boleto

### Fase 3 — Integração backend

- Criar endpoint(s) de pagamento
- Integrar cliente frontend
- Tratar estados `authorized/pending/failed`

### Fase 4 — Qualidade e entrega

- Testes unitários/E2E
- Ajustes de UX responsivo
- Documentação final (README + Swagger se aplicável)

---

## Riscos e Mitigações

- **Risco:** duplicidade de pagamento por múltiplos cliques  
  **Mitigação:** idempotência + botão bloqueado em loading

- **Risco:** inconsistência de valor entre frontend e backend  
  **Mitigação:** backend como source of truth (`order.grand_total`)

- **Risco:** flakiness em E2E de PIX/Boleto  
  **Mitigação:** mocks determinísticos e polling controlado

---

## Resultado Esperado

Ao final, o produto terá uma etapa de pagamentos moderna, clara e confiável, alinhada ao padrão de e-commerce de alto volume, com métodos populares no Brasil e pronta para evoluir para integração real com gateway.