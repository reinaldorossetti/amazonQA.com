# 📊 Tests Dashboard

Painel de qualidade estático que lê artefatos de testes (JUnit, Coverage, Playwright) e exibe métricas via histórico de snapshots JSON. Publicado automaticamente via GitHub Actions no GitHub Pages.

👉 **[Leia as regras de arquitetura do dashboard aqui](docs/RULES.md)**

---

## 🗂️ Estrutura de Pastas

```
tests-dashboard/
│
├── index.html                       # Entry point do dashboard (publicado no gh-pages)
├── generate-dashboard-metrics.js    # Script Node.js executado pela esteira CI
├── api-server.js                    # Servidor local para desenvolvimento
├── server.bat                       # Helper Windows para iniciar o servidor local
│
├── src/                             # Código-fonte JavaScript do dashboard
│   ├── dashboard-utils.js           # Helpers matemáticos, constantes e render utils
│   ├── dashboard-tabs.js            # Controlador de navegação por abas
│   ├── dashboard-summary.js         # Renderiza a aba "Resumo" (pirâmide + totais)
│   ├── dashboard-reports.js         # Renderiza a aba "Relatórios" (grid de links)
│   └── dashboard-metrics.js         # Renderiza a aba "Métricas CI" (gráficos, QA efficiency)
│
├── assets/                          # Arquivos estáticos de estilo e dados
│   ├── css/
│   │   └── dashboard-styles.css     # Estilos globais do dashboard (dark mode, componentes)
│   └── data/
│       └── dashboard-metrics-data.js # Fallback de dados para ambientes sem CI
│
├── history/                         # Snapshots gerados pela esteira (não editar manualmente)
│   ├── dates.json                   # Lista das últimas 7 execuções (índice do sidebar)
│   ├── latest-scan.json             # Debug: caminhos descobertos pela última execução da CI
│   ├── qa-efficiency-metrics.json   # Referência completa de estrutura de métricas de QA
│   └── YYYY-MM-DD-HHhMMm.json       # Snapshot por execução (gerado automaticamente)
│
├── docs/                            # Documentação do projeto
│   ├── README.md                    # Este arquivo
│   └── RULES.md                     # Regras e decisões de arquitetura do dashboard
│
├── scripts/                         # Scripts auxiliares e utilitários
│   ├── generate-failure-report.js
│   └── get-test-stats.js
│
└── prompts/                         # Prompts de contexto para assistentes de IA
    └── METRICAS_SUGERIDAS.md
```

> **Nota:** Os diretórios abaixo são gerados pela CI e **não devem ser commitados**:
> `unit-tests-web/`, `unit-tests-backend/`, `e2e-junit-*/`, `playwright-report-*/`

---

## 🚀 Dev Quickstart (local)

### 1. Inicie o servidor estático (da raiz do repo):
```bash
python -m http.server 8000
# ou (Windows)
tests-dashboard/server.bat
```

### 2. Inicie a API de geração de métricas:
```bash
npm run dashboard-api
# ou
node ./tests-dashboard/api-server.js
```

### 3. Abra no navegador:
```
http://localhost:8000/tests-dashboard/index.html
```

---

## ⚙️ Como funciona a Esteira CI

O arquivo `.github/workflows/e2e-pipeline.yml` executa os seguintes jobs em paralelo:

| Job | O que faz |
|---|---|
| `unit` | Roda testes unitários Web (Vitest) e Backend-ts, faz upload dos artefatos |
| `contract` | Roda testes de contrato Pact, faz upload dos pacts gerados |
| `e2e` | Roda testes E2E Playwright em matrix (chromium, edge, api), faz upload do JUnit e HTML report |
| `deploy` | Baixa todos os artefatos, restaura histórico do gh-pages, executa o gerador e publica |

### O que o `generate-dashboard-metrics.js` produz:

- `dashboard-metrics.json` — dados da execução mais recente
- `history/YYYY-MM-DD-HHhMMm.json` — snapshot completo, incluindo seção `qaEfficiency`
- `history/dates.json` — índice com as últimas 7 execuções (usado pelo sidebar)
- `history/latest-scan.json` — metadados de debug da CI

---

## 📐 Métricas de Eficiência de QA

A seção `qaEfficiency` presente em cada snapshot contém:

| Campo | Descrição |
|---|---|
| `defectDensity` | Bugs detectados por KLOC (mil linhas de código) |
| `automationROI` | Economia de horas e valor financeiro com automação |
| `flakiness` | Taxa percentual de testes instáveis (E2E) |
| `defectLeakage` | Percentual de bugs escapados para produção vs. detectados em QA |
| `testAutomationCoverage` | Percentual de casos cobertos por automação vs. total |
| `mttr` | Tempo médio de resposta/reparo de bugs |

---

## 📝 Notas Técnicas

- O dashboard é **100% estático** — não precisa de backend em produção.
- O `assets/data/dashboard-metrics-data.js` é o **fallback** carregado primeiro; se a CI gerou novos dados eles sobrescrevem via fetch do JSON de histórico.
- O versionamento de cache (`?v=3`) nos scripts garante que o browser não use versões antigas.
- `latest-scan.json` é o principal aliado para debugar falhas de geração na CI.
