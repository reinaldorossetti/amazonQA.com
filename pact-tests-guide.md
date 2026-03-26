# Guia Completo de Testes de Pacto (Pact-JS)

Este documento explica como funcionam os **testes de pacto** no projeto `tester.com`, cobrindo:

- conceito e objetivo dos contract tests,
- bibliotecas utilizadas,
- estrutura de arquivos,
- fluxo completo (consumer → pact file → provider verification),
- exemplos práticos baseados na implementação atual,
- boas práticas para evolução.

---

## 1) Resumo: o que são testes de pacto?

**Testes de pacto** (contract tests) validam a integração entre dois sistemas sem precisar subir todo o ambiente E2E.

No nosso cenário:

- **Consumer**: frontend (`src/db/api.js`) que consome endpoints REST.
- **Provider**: backend Next.js (`server/app/api/**`).

Em vez de testar tudo junto, o consumer define suas expectativas de request/response em um contrato (pact) e o provider prova que atende esse contrato.

### Benefícios

- Detecta quebra de contrato cedo.
- Reduz dependência de testes E2E pesados para validação de integração.
- Dá rastreabilidade de compatibilidade entre versões de consumer/provider.

---

## 2) Bibliotecas e ferramentas utilizadas

Dependências adicionadas no projeto:

- `@pact-foundation/pact` (`^16.3.0`)
  - DSL para criação de interações (`PactV3`, `MatchersV3`)
  - `Verifier` para validação provider.
- `@pact-foundation/pact-cli` (`^18.0.0`)
  - Ferramentas de broker (`pact-broker`, `can-i-deploy`, etc.) para CI/CD.
- `dotenv` (`^17.3.1`)
  - Carregamento de variáveis de ambiente no script de verificação do provider.

Ferramenta de teste usada para executar os consumer contracts:

- `vitest` (config dedicada para Pact em `vitest.pact.config.js`).

---

## 3) Estrutura de arquivos dos testes de pacto

```text
.
├─ pacts/
│  └─ tester-web-frontend-tester-backend-api.json
├─ tests/
│  └─ pact/
│     ├─ consumer/
│     │  └─ backend.consumer.pact.test.js
│     └─ provider/
│        └─ verify-provider.mjs
├─ vitest.pact.config.js
└─ package.json
```

### Papel de cada arquivo

- `tests/pact/consumer/backend.consumer.pact.test.js`
  - Define as interações esperadas pelo frontend.
  - Gera o arquivo de contrato em `pacts/`.

- `pacts/*.json`
  - Contrato serializado gerado pelo consumer test.
  - É o artefato que o provider deve verificar.

- `tests/pact/provider/verify-provider.mjs`
  - Executa a validação do backend real contra os pact files.
  - Prepara estados (`stateHandlers`) e autenticação (`requestFilter`).

- `vitest.pact.config.js`
  - Isola a execução dos tests de consumer pact no Vitest.

- `package.json`
  - Scripts padronizados para execução local e CI.

---

## 4) Scripts disponíveis

No `package.json`:

- `test:pact:consumer` → executa apenas consumer contracts.
- `test:pact:provider` → executa apenas provider verification.
- `test:pact` → pipeline completo (`consumer` + `provider`).

Fluxo recomendado para dev local:

1. rodar `test:pact:consumer` para gerar/atualizar contratos;
2. rodar `test:pact:provider` para validar backend;
3. rodar `test:pact` para validação ponta a ponta em um comando.

---

## 5) Passo a passo completo (do zero)

## 5.1 Instalar dependências

As bibliotecas de pacto devem estar no projeto raiz (já implementado):

- `@pact-foundation/pact`
- `@pact-foundation/pact-cli`
- `dotenv`

## 5.2 Criar configuração de testes Pact no Vitest

Arquivo: `vitest.pact.config.js`

- ambiente: `jsdom`
- include: `tests/pact/consumer/**/*.test.js`
- timeout dedicado para chamadas de mock server

## 5.3 Implementar consumer contracts

Arquivo: `tests/pact/consumer/backend.consumer.pact.test.js`

Implementação atual cobre 3 contratos iniciais:

1. `GET /api/products?category=Eletrônicos`
2. `GET /api/cart?userId=9001`
3. `POST /api/cart` (batch)

### Padrão usado

- `PactV3` para criar o provider mock.
- `MatchersV3` para validar por tipo/formato (não por valor fixo).
- `provider.executeTest()` para executar client real (`src/db/api.js`) contra mock server.

## 5.4 Gerar o contrato

Ao executar consumer tests, o arquivo é gerado em:

- `pacts/tester-web-frontend-tester-backend-api.json`

## 5.5 Implementar provider verification

Arquivo: `tests/pact/provider/verify-provider.mjs`

Esse script:

- carrega `.env` e `server/.env.local`;
- inicia provider local (se não estiver rodando);
- usa `Verifier` para validar os pact files;
- configura `stateHandlers` para preparar banco/dados;
- injeta token Bearer via `requestFilter` para rotas protegidas;
- suporta broker opcional via variáveis de ambiente.

## 5.6 Executar validação completa

Rodar `test:pact` para confirmar:

- consumer contract **passa**;
- provider verification **passa**;
- contrato está alinhado entre frontend e backend.

---

## 6) Exemplos comentados

## Exemplo A — Consumer com Matchers

No consumer test de `GET /api/products`, usamos matchers para evitar teste frágil:

- `id: integer(1)`
- `name: string('Produto Pact')`
- `price: number(199.9)`
- `body: eachLike({...})`

Isso significa: “o provider pode retornar valores diferentes, mas precisa manter o tipo/estrutura esperados”.

## Exemplo B — Contrato autenticado de carrinho

Para `GET /api/cart` e `POST /api/cart`, o consumer descreve `Authorization: Bearer pact-token`.

Na verificação do provider, o `requestFilter` substitui isso por token real assinado com `signAccessToken`, mantendo segurança sem codificar token estático inválido no backend.

## Exemplo C — Provider States

Estados implementados:

- `catálogo com produtos disponíveis`
- `usuário autenticado com itens no carrinho`
- `usuário autenticado apto para adicionar itens no carrinho`

Cada estado prepara dados mínimos no PostgreSQL para tornar a verificação determinística.

---

## 7) Variáveis de ambiente úteis

Uso local (já com fallback no script):

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `JWT_AUDIENCE`

Uso com Broker (opcional/CI):

- `PACT_BROKER_BASE_URL`
- `PACT_BROKER_TOKEN`
- `PACT_PROVIDER_VERSION`
- `PACT_PROVIDER_BRANCH`

Observação:

- sem broker, a validação local funciona com `pactFilesOrDirs`.
- com broker, o script ativa publicação e `enablePending` quando `PACT_PROVIDER_VERSION` está definido.

---

## 8) Como evoluir os testes de pacto

Próximos cenários recomendados:

1. `POST /api/users/login` (200 e 401)
2. `GET /api/cart/{id}` (200 e 404 `Carrinho não encontrado`)
3. `DELETE /api/cart` (200 e 404)
4. cenários de erro de validação (400) para payload inválido

Boas práticas:

- manter contratos pequenos e focados em comportamento consumido;
- evitar acoplamento com payloads completos “hardcoded” sem matcher;
- usar provider states idempotentes;
- versionar e revisar pact files em PRs.

---

## 9) Troubleshooting rápido

### 9.1 Falha de autenticação no provider

Verificar:

- `requestFilter` está injetando `Authorization` correto;
- token assinado com as mesmas variáveis JWT do backend.

### 9.2 Provider não sobe para verificar

Verificar:

- `DATABASE_URL` válido;
- backend respondendo em `http://127.0.0.1:3001`.

### 9.3 Contrato mudou e provider falhou

- revisar diff em `pacts/*.json`;
- confirmar se mudança de contrato foi intencional;
- ajustar provider ou renegociar contrato no consumer.

---

## 10) Conclusão

Com o Pact-JS implantado, o projeto ganha uma camada robusta de validação de integração entre frontend e backend:

- o consumer declara o que precisa,
- o provider comprova que entrega,
- e a equipe reduz risco de regressão entre serviços.

Em resumo: **testes de pacto são o “acordo formal executável” entre quem consome e quem fornece a API**.
