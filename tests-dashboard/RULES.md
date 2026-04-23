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
- **API Tests:** Link para o relatório de integração de API.

### 2.3. Aba: Métricas CI (CI Metrics)
Visão técnica e detalhada dos números da última pipeline:
- **Status da Esteira:** Badge dinâmico (Verde/Vermelho) que indica se a última execução completa passou ou falhou.
- **Cards de Métricas:** Números absolutos de testes executados e falhas por categoria (Unit Web, Unit Backend, API, E2E).
- **Taxa de Sucesso:** Gráficos de rosca (Donut Charts) exibindo o percentual de sucesso de cada suíte.
- **Cobertura de Código (Vitest):** Barras de progresso detalhando Statements, Lines, Functions e Branches do projeto Web.
- **Comparativo por Projeto:** Gráficos de barras que mostram a proporção de Passados vs Falhas vs Pulados para cada ambiente/projeto.

---

## 3. Regras de Processamento de Dados
O dashboard não utiliza um banco de dados tradicional; ele consome artefatos de teste em tempo real ou via snapshots estáticos:

1.  **Parsing de JUnit (XML):** O dashboard lê arquivos `junit.xml` gerados pelo Vitest e Playwright para extrair contagens de testes e status.
2.  **Scraping de Cobertura (HTML):** Extrai métricas de cobertura diretamente do `index.html` gerado pelo Vitest (Istanbul/v8).
3.  **Histórico via JSON:** Armazena snapshots diários na pasta `/history` em formato JSON para permitir a navegação retroativa. O dashboard deve listar os últimos 5 snapshots, exibindo a **Data e Hora** da execução. Os itens devem estar em ordem decrescente (do mais recente para o mais antigo). Ao clicar na aba de "Métricas CI", o dashboard deve carregar e selecionar automaticamente o snapshot mais recente.
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
- Verify 5 execution entries in the sidebar (displaying Date and Time)
- Verify current date is the first and selected
- Verify data is not zeroed
- Report final status
