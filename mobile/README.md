# 📱 AmazonQA Mobile — Plano do Projeto (React Native)

Este plano define a implementação do app **mobile** usando **React Native** (com Expo), consumindo o **mesmo backend atual** do projeto (`server/`) e mantendo as **mesmas features funcionais descritas no `README.md` principal**.

A interface seguirá o estilo da **Amazon** (hierarquia visual, foco em busca/catálogo/carrinho/checkout) com componentes em **Material Design**.

---

## 🎯 Objetivo

Construir um aplicativo mobile (Android/iOS) que replique a jornada completa de compra do AmazonQA web:

- Catálogo e busca de produtos
- Login/cadastro de usuários
- Carrinho persistido no backend
- Checkout com criação de pedido (`orders`) com `Idempotency-Key`
- Pagamentos (`credit`, `debit`, `pix`, `boleto`) com split payment
- Página de confirmação (resumo + dados de pagamento)
- Internacionalização PT/EN

---

## 🧱 Stack Técnica (Mobile)

- **React Native** (obrigatório)
- **Expo** (bootstrap e tooling)
- **TypeScript**
- **React Navigation** (stack + tabs)
- **React Native Paper** (Material Design)
- **React Query (@tanstack/react-query)** para cache de API
- **Axios** (cliente HTTP)
- **React Hook Form + Zod** (formulários e validação)
- **AsyncStorage** (persistência de sessão e preferências)
- **expo-localization + i18next** (PT/EN)
- **Jest + React Native Testing Library** (unit/component)
- **Detox** ou **Maestro** (E2E mobile, fase posterior)

> Observação: no React Native, a adoção recomendada de Material é via **React Native Paper**.

---

## 🏗️ Estrutura Proposta (pasta `mobile/`)

```text
mobile/
├── README.md
├── package.json
├── app.json
├── babel.config.js
├── tsconfig.json
├── .env                         # EXPO_PUBLIC_API_BASE_URL
├── src/
│   ├── app/
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── ShopNavigator.tsx
│   │   │   └── types.ts
│   │   └── providers/
│   │       ├── QueryProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       ├── AuthProvider.tsx
│   │       └── LanguageProvider.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/LoginScreen.tsx
│   │   │   ├── screens/RegisterScreen.tsx
│   │   │   ├── services/auth.api.ts
│   │   │   ├── hooks/useAuth.ts
│   │   │   └── validation/
│   │   ├── catalog/
│   │   │   ├── screens/HomeScreen.tsx
│   │   │   ├── screens/ProductDetailsScreen.tsx
│   │   │   ├── components/ProductCard.tsx
│   │   │   └── services/products.api.ts
│   │   ├── cart/
│   │   │   ├── screens/CartScreen.tsx
│   │   │   ├── components/CartItem.tsx
│   │   │   └── services/cart.api.ts
│   │   ├── checkout/
│   │   │   ├── screens/CheckoutScreen.tsx
│   │   │   └── services/orders.api.ts
│   │   ├── payments/
│   │   │   ├── screens/PaymentsScreen.tsx
│   │   │   ├── components/PaymentMethodSelector.tsx
│   │   │   ├── components/CardBrandChips.tsx
│   │   │   └── services/payments.api.ts
│   │   ├── orders/
│   │   │   ├── screens/OrderHistoryScreen.tsx
│   │   │   ├── screens/OrderDetailsScreen.tsx
│   │   │   └── services/orders.api.ts
│   │   └── confirmation/
│   │       └── screens/ThankYouScreen.tsx
│   ├── shared/
│   │   ├── api/client.ts
│   │   ├── ui/
│   │   ├── theme/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── types/
│   └── i18n/
│       ├── pt-BR.json
│       ├── en-US.json
│       └── index.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🔁 Alinhamento com o Backend Atual (sem novo backend)

O app mobile deve consumir exatamente os endpoints já existentes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/cart?userId=<id>`
- `POST /api/cart`
- `DELETE /api/cart`
- `POST /api/orders` (com `Authorization` + `Idempotency-Key`)
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `POST /api/orders/:id/payments`
- `GET /api/orders/:id/payments/:paymentId`
- `GET /api/orders/:id/boleto/:reference`

### Contratos e regras críticas

- Token JWT/Bearer em endpoints protegidos
- Idempotência no checkout (`Idempotency-Key` único por tentativa)
- Suporte a split payment (múltiplas chamadas de pagamento até completar total)
- Tratamento de estados de pedido/pagamento conforme regra já existente

---

## 🎨 Diretriz de UI/UX (Amazon + Material)

### Base visual

- **Topo com busca em destaque** (padrão jornada Amazon)
- **Cards de produto** com imagem, preço, fabricante e CTA
- **Carrinho com resumo fixo** e CTA de checkout claro
- **Feedbacks visuais** por status (loading, sucesso, erro)
- **Tema Material** com componentes Paper (`Appbar`, `Card`, `Button`, `TextInput`, `Snackbar`, `Chip`)

### Tokens de design (inicial)

- Cor primária inspirada Amazon: `#131921`
- Cor de destaque/ação: `#FF9900`
- Fundo claro: `#F7F7F7`
- Tipografia com escala Material 3
- Espaçamento por múltiplos de 4/8

---

## 🧩 Mapeamento de Features (Web → Mobile)

1. **Auth**: login, logout, cadastro PF/PJ com validações
2. **Catálogo**: listagem, busca por texto, filtro por categoria
3. **Detalhes do produto**: imagem, preço, descrição, quantidade
4. **Carrinho**: adicionar/remover/alterar quantidade
5. **Checkout**: criar pedido com chave idempotente
6. **Pagamentos**: crédito, débito, pix, boleto e split payment
7. **Confirmação**: resumo, dados de referência do pagamento
8. **Pedidos**: histórico e detalhes
9. **i18n**: alternância PT/EN com persistência local

---

## 🛣️ Plano de Execução por Fases

### Fase 0 — Setup (1 a 2 dias)

- Inicializar app React Native com Expo + TypeScript
- Configurar navegação, tema Material e providers globais
- Configurar cliente HTTP e variáveis de ambiente
- Estruturar pastas por feature

### Fase 1 — Base funcional (3 a 5 dias)

- Auth (login/cadastro)
- Catálogo + detalhes
- Carrinho conectado ao backend
- Testes unitários iniciais

### Fase 2 — Checkout & Orders (3 a 4 dias)

- Criação de pedido com `Idempotency-Key`
- Histórico de pedidos e detalhes
- Tratamento de estados/transições

### Fase 3 — Payments (4 a 6 dias)

- Fluxos de crédito/débito/pix/boleto
- Split payment e validações de total
- Tela de confirmação

### Fase 4 — Qualidade e Release (3 a 5 dias)

- Testes de integração
- E2E mobile smoke
- Hardening de erros, loading e empty states
- Build Android/iOS e checklist de publicação

---

## ✅ Critérios de Aceite

- Paridade funcional com as features descritas no README principal
- Integração 100% com backend atual (sem fork de API)
- UX consistente com Amazon-style + Material Design
- Cobertura mínima de testes unitários em fluxos críticos
- Fluxo de pedido/pagamento funcionando ponta a ponta
- i18n PT/EN operacional em telas principais

---

## 🧪 Estratégia de Testes (Mobile)

- **Unitários**: hooks, serviços de API, validadores
- **Componentes**: formulários, cards, seletores de pagamento
- **Integração**: auth → catálogo → carrinho → checkout
- **E2E (smoke)**: login, compra simples, pagamento cartão, confirmação

---

## 🔐 Segurança e Configuração

- Armazenar token de sessão com estratégia segura
- Nunca versionar segredos
- Usar `.env` no mobile com:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

> Em emulador/dispositivo físico, ajustar host (ex.: IP local da máquina).

---

## 🏃 Como Rodar o Emulador Android

1. Descubra os emuladores disponíveis:
```bash
emulator -list-avds
```

2. Inicie o emulador (substitua `Pixel_6_Pro` pelo nome do seu emulador):
```bash
emulator -avd Pixel_6_Pro &
```

> **Nota:** Certifique-se de que a pasta de ferramentas do Android SDK (`emulator`) está no seu PATH.

---

## 📌 Backlog inicial (priorizado)

1. Bootstrap Expo + TypeScript + Paper + Navigation
2. Cliente API + interceptors + tratamento global de erros
3. Auth completo (login/cadastro + persistência de sessão)
4. Catálogo, busca e detalhes
5. Carrinho completo
6. Checkout com idempotência
7. Payments + split payment
8. Thank You + histórico de pedidos
9. i18n PT/EN
10. Testes e pipeline de qualidade

---

## 📦 Resultado esperado

Ao final, a pasta `mobile/` terá um app React Native pronto para evolução, mantendo **paridade funcional com o AmazonQA web**, mesma base de backend e experiência visual consistente com **Amazon + Material Design**.
