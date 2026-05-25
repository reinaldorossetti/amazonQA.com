# Documentação de Regras e Funcionalidades: QA Dashboard

Este documento detalha as funcionalidades, regras de negócio e a estrutura técnica do Dashboard de Qualidade do projeto **tester.com**. O dashboard atua como o ponto central de visibilidade para todos os esforços de teste (Unidade, Integração e E2E).

---

## 1. Objetivo Principal
Prover uma visão unificada e transparente da saúde do projeto através de métricas extraídas automaticamente da esteira de CI/CD (GitHub Actions).

---

## 2. Estrutura de Navegação
O dashboard é dividido em três áreas principais acessíveis via abas:

### 2.1. Aba: Resumo (Summary)
Focada na estratégia de testes e visão macro.
- **Pirâmide de Testes:** Visualização conceitual da estratégia, dividida em Unidade (Base), Integração/Contrato (Meio) e E2E (Topo).
- **Visão Geral:** Cards destacados com o total acumulado de testes com **Sucesso (Passados)** e **Falha**.
- **Histórico de Execuções (Sidebar):** Permite navegar por snapshots de dias anteriores, facilitando a análise de regressões ou tendências de estabilidade.

### 2.2. Aba: Relatórios (Reports)
Central de atalhos para os relatórios detalhados gerados pelas ferramentas de teste:
- **Web & Backend (Vitest):** Links diretos para os relatórios HTML de testes unitários e cobertura.
- **E2E (Playwright):** Atalhos para os resultados das execuções em diferentes browsers (Chromium, Edge).
- **API Tests:** Playwright API, REST Assured (Allure + JUnit em `rest-assured-allure-report/` e `api-rest-assured/`).

### 2.3. Aba: Métricas CI (CI Metrics)
Visão técnica e detalhada dos números da última pipeline:
Dynamic Metrics (CI) — These numbers come from the latest run published by the pipeline.
- **Status da Esteira:** Badge dinâmico (Verde/Vermelho) que indica se a última execução completa passou ou falhou.

Example:
## métricas CI
Status da Execução
Métricas carregadas com sucesso
Total de testes executados
510
Total de Falhas
80
Total de Sucesso
430
Total Não Executados
10
Unit Web executados
171
Falhas Unit Web
0
Unit Backend executados
47
Falhas Unit Backend
0
Testes de API executados
104
Falhas Testes de API
62
E2E executados
146
Falhas E2E
18
Cobertura Web (Statements)
83.2%
Cobertura Web (Lines)
84.9%

- **Cards de Métricas:** Números absolutos de testes executados e falhas por categoria (Unit Web, Unit Backend, API, E2E).
- **Taxa de Sucesso:** Gráficos de rosca (Donut Charts) exibindo o percentual de sucesso de cada suíte.
- **Cobertura de Código (Vitest):** Barras de progresso detalhando Statements, Lines, Functions e Branches do projeto Web.
- **Comparativo por Projeto:** Gráficos de barras que mostram a proporção de Passados vs Falhas vs Pulados para cada ambiente/projeto.

---

## 3. Regras de Processamento de Dados
O dashboard não utiliza um banco de dados tradicional; ele consome artefatos de teste em tempo real ou via snapshots estáticos:

1.  **Parsing de JUnit (XML):** O dashboard lê arquivos `junit.xml` gerados pelo Vitest e Playwright para extrair contagens de testes e status.
2.  **Scraping de Cobertura (HTML):** Extrai métricas de cobertura diretamente do `index.html` gerado pelo Vitest (Istanbul/v8).
3.  **Histórico via JSON:** Armazena snapshots diários na pasta `/history` em formato JSON para permitir a navegação retroativa. O dashboard deve listar os últimos **7 snapshots** (limite configurado para cálculos de ROI acumulado e exibição), exibindo a **Data e Hora** da execução. Os itens devem estar em ordem decrescente (do mais recente para o mais antigo). Ao clicar na aba de "Métricas CI", o dashboard deve carregar e selecionar automaticamente o snapshot mais recente.
4.  **Cache-Busting:** Todas as requisições de dados utilizam um parâmetro de timestamp (`?t=...`) para garantir que o navegador não exiba dados obsoletos após uma nova execução da pipeline.
5.  **Fallback:** Caso os arquivos XML não estejam disponíveis (ex: erro na pipeline antes da geração dos artefatos), o dashboard tenta carregar um arquivo `dashboard-metrics.json` ou exibe valores zerados com um alerta ao usuário.

---

## 4. Tecnologias Utilizadas
- **Frontend:** HTML5, CSS3 (Vanilla com variáveis para temas), JavaScript (Vanilla ES6+).
- **Tipografia:** Inter (Google Fonts).
- **Ícones:** SVG customizados.
- **Integração:** GitHub Actions (automatização da geração de métricas e deploy no GitHub Pages).

---

## 5. Manutenção e Atualização
- O dashboard é atualizado automaticamente a cada push ou execução agendada na pipeline.
- Para adicionar novos tipos de teste, é necessário atualizar o arquivo `dashboard-metrics.js` para incluir o novo caminho do arquivo JUnit e mapear os labels correspondentes.

## 6. Checklist
- Navigate to http://localhost:8080/dashboard.html
- Click on "Métricas CI"
- Verify 7 execution entries in the sidebar (displaying Date and Time)

MenuExecuções Recentes
Selecione uma execução para carregar métricas dessa data.
23/04/2026 19h30m
23/04/2026 17h30m

Folder history: 
/tests-dashboard/history/
2026-04-23-19h30m.json
2026-04-23-17h30m.json
- Verify current date is the first and selected
- Verify data is not zeroe'd
- Report final status


Execuções Recentes
Selecione uma execução para carregar métricas dessa data.
Deve mostrar no rodapé: Mostrando últimas 7 execuções, não deve exibir mais que 7 execuções.
