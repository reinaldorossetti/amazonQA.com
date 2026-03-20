# 🧪 README de Testes — Projeto `tester.com`

Este documento consolida **como os testes estão estruturados**, **quais frameworks são usados**, e **os resultados mais recentes registrados** no repositório.

---

## 🎯 Objetivo da suíte de testes

A estratégia de testes do projeto cobre principalmente:

- **Fluxos de frontend (E2E/UI)**: autenticação, catálogo, carrinho/checkout, cadastro, detalhes de produto e regras de segurança/acesso.
- **Fluxos de API**: produtos, usuários e carrinho.
- **Evidências de falha**: screenshot, vídeo e trace na primeira repetição.

---

## 📊 Resumo quantitativo dos testes

### 1) Casos de teste implementados no código

- **Arquivos spec totais:** `12`
	- Frontend: `9` arquivos
	- API: `3` arquivos
- **Casos de teste (`test(...)`) implementados:** `47`
	- Frontend: `38`
	- API: `9`

### 2) Resultado da última execução registrada (`junit-report.xml`)

Referência: arquivo `junit-report.xml` na raiz.

- **Testes executados:** `2`
- **Passaram:** `0`
- **Falharam:** `2`
- **Ignorados (skipped):** `0`
- **Erros técnicos (errors):** `0`
- **Tempo total:** `9.843s`

Taxas da última execução:

- **Taxa de sucesso:** $0/2 = 0\%$
- **Taxa de falha:** $2/2 = 100\%$

> Observação importante: as falhas registradas foram de infraestrutura de execução (`ERR_CONNECTION_REFUSED` em `http://localhost:5174`), indicando aplicação frontend indisponível no momento da execução do teste, e não necessariamente falha funcional da regra de negócio.

---

## 🧱 Estrutura dos testes no repositório

```text
e2e/
├── data/
│   └── products.mock.ts
├── fixtures/
│   ├── failure-capture.fixture.ts
│   ├── login.fixture.ts
│   ├── register.fixture.ts
│   ├── test-data.fixture.ts
│   ├── ui.fixture.ts
│   └── selectors/selectors.ts
├── helpers/
│   ├── auth.ts
│   ├── PageBase.ts
│   ├── RegisterPage.ts
│   └── selectors.ts
├── specs/
│   ├── api/
│   │   ├── cart.api.spec.ts
│   │   ├── products.api.spec.ts
│   │   └── users.api.spec.ts
│   └── frontend/
│       ├── auth.spec.ts
│       ├── cart-checkout.spec.ts
│       ├── catalog.spec.ts
│       ├── login.spec.ts
│       ├── product-details.spec.ts
│       ├── register.spec.ts
│       ├── register-language.spec.ts
│       ├── register-login.spec.ts
│       └── security.spec.ts
└── results/
		└── artefatos auxiliares de execução
```

### Arquivos de saída de execução

- `junit-report.xml`: resultado em formato JUnit (bom para CI).
- `playwright-report/`: relatório HTML navegável.
- `test-results/`: evidências por cenário (screenshot, vídeo, trace, contexto de erro).

---

## ⚙️ Configuração atual do Playwright

Arquivo: `playwright.config.ts`

- `timeout` por teste: **45s**
- `expect.timeout`: **15s**
- Paralelismo: `fullyParallel: true`
- Tentativas: `1` local / `2` em CI
- Workers: `70%` local / `3` em CI
- Reporters:
	- `list`
	- `html` (pasta `playwright-report`)
	- `junit` (arquivo `junit-report.xml`)
- Coleta de evidências:
	- `trace: on-first-retry`
	- `screenshot: only-on-failure`
	- `video: retain-on-failure`

### Projetos definidos no config

- `frontend-chromium`
- `frontend-webkit`
- `frontend-edge`
- `api`

> Nota técnica: o `testDir` está apontando para `./e2e/specs/frontend`, então a execução padrão foca os testes de frontend.

---

## 🧰 Frameworks e bibliotecas utilizadas nos testes

### Playwright (`@playwright/test`)

É o framework principal de automação. No projeto, ele oferece:

- Execução E2E com múltiplos navegadores.
- API testing com `request` (nos specs de API).
- Fixtures reutilizáveis para setup e organização.
- Repetição automática e coleta rica de evidências.
- Relatórios HTML e JUnit para análise local e CI.

### Faker (`@faker-js/faker`)

Usado para gerar dados dinâmicos de teste (ex.: cadastro), reduzindo colisões de dados e aumentando a robustez dos cenários.

### Node.js + scripts utilitários

- Script customizado de falhas: `scripts/generate-failure-report.js`
- Comando para abrir relatório de falhas em HTML.

---

## 🚀 Instalação detalhada para executar os testes

## 1. Pré-requisitos

- Node.js 18+
- npm
- Docker + Docker Compose

## 2. Instalar dependências (frontend)

Na raiz do projeto:

`npm install`

## 3. Instalar dependências (backend/API)

Na pasta `server/`:

`npm install`

## 4. Subir banco de dados

Na raiz do projeto:

`docker compose up -d`

## 5. Preparar base de dados

Na pasta `server/`:

`npm run seed`

## 6. Iniciar backend

Na pasta `server/`:

`npm run dev`

Backend esperado em: `http://localhost:3001`

## 7. Iniciar frontend

Na raiz do projeto:

`npm run dev`

Frontend esperado em: `http://localhost:5174`

> Esse passo é crítico para os testes de frontend. Sem a aplicação ativa, haverá `ERR_CONNECTION_REFUSED`.

---

## ▶️ Execução dos testes (detalhado)

Comandos disponíveis no `package.json` da raiz:

- `npm run test:e2e` → execução padrão Playwright
- `npm run test:e2e:ui` → modo UI interativo
- `npm run test:e2e:debug` → modo debug
- `npm run test:e2e:headed` → execução com navegador visível
- `npm run test:e2e:report` → abre último relatório HTML
- `npm run test:e2e:failure-report` → gera relatório customizado de falhas

### Sequência recomendada de execução local

1. Confirmar banco/API/frontend ativos.
2. Rodar `npm run test:e2e`.
3. Abrir relatório com `npm run test:e2e:report`.
4. Se houver falha, investigar `test-results/` (screenshot/vídeo/trace).

---

## 🔍 Interpretação rápida de falhas

Quando um teste falhar:

1. Verifique se frontend (`5174`) e backend (`3001`) estão ativos.
2. Abra o HTML report para timeline e logs.
3. Inspecione o `trace.zip` do cenário com falha.
4. Revise os fixtures envolvidos no cenário.

---

## ✅ Conclusão

Hoje o projeto possui uma suíte robusta com **47 cenários implementados**, estrutura organizada por domínio (frontend/API), e uma configuração Playwright madura para investigação de falhas.

No último registro JUnit, foram executados **2 testes de segurança**, ambos com falha por indisponibilidade da aplicação no ambiente de execução. Com os serviços corretamente ativos, a suíte está preparada para validação funcional completa com rastreabilidade detalhada.
