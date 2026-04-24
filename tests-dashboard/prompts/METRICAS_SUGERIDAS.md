# Proposta de Novas Métricas de Qualidade e Cobertura

Este documento detalha a inclusão de métricas avançadas para elevar o patamar de visibilidade técnica do dashboard de qualidade do projeto **tester.com**.

## 1. Novas Métricas Sugeridas

### 🛡️ Automação e Estabilidade
*   **Taxa de Flakiness (Instabilidade):** Identifica testes que falham de forma intermitente sem alterações no código. Essencial para manter a confiança na esteira.
*   **Duração da Execução por Suíte:** Monitora o tempo total de cada camada (Unit, API, E2E). Ajuda a identificar gargalos de performance na pipeline.
*   **Tempo Médio de Recuperação (MTTR):** Mede quanto tempo a esteira permanece em "Vermelho" antes de ser corrigida.

### 📊 Cobertura Avançada
*   **Cobertura de Backend (Vitest Backend):** Atualmente o dashboard foca na cobertura Web. Adicionar as métricas do Backend-ts trará uma visão 360º do sistema.
*   **Mutation Score:** Mede a eficácia dos testes unitários ao injetar bugs propositais no código ("mutantes"). Se os testes não falharem, eles são considerados "fracos".
*   **Cobertura de Endpoints API:** Percentual de rotas da API que possuem ao menos um teste de contrato ou integração validado.

### 🚀 Eficiência de QA
*   **Densidade de Defeitos por Sprint:** Número de bugs encontrados vs. tamanho do código (ex: bugs por 1k linhas).
*   **ROI de Automação:** Comparativo de tempo economizado com automação vs. tempo estimado de execução manual.

---

## 2. Plano de Implementação

### Fase 1: Expansão da Cobertura (Curto Prazo)
1.  **Backend Coverage:** Configurar o Vitest no `server-ts` para gerar relatórios de cobertura em formato JSON.
2.  **Dashboard Update:** Atualizar o `dashboard-metrics.js` para consumir o `coverage-final.json` do backend e exibir os cards de "Cobertura Backend".

### Fase 2: Performance e Estabilidade (Médio Prazo)
1.  **Time Tracking:** Modificar o script de geração de métricas (`generate-dashboard-metrics.js`) para ler o tempo de execução dos arquivos JUnit (atributo `time`).
2.  **Visualização:** Adicionar gráficos de linha no dashboard mostrando a evolução do tempo de teste nas últimas 7 execuções.

### Fase 3: Confiabilidade (Longo Prazo)
1.  **Flakiness Detection:** Implementar um "re-run" automático na pipeline. Se um teste falha na primeira e passa na segunda, ele é marcado como *Flaky*.
2.  **Mutation Testing:** Integrar o [Stryker Mutator](https://stryker-mutator.io/) na esteira CI para gerar o *Mutation Score*.

---

## 3. Exemplo de Visão de Negócio

| Métrica | Valor Sugerido | Status Esperado |
| :--- | :--- | :--- |
| **Cobertura Backend (Lines)** | > 90% | 🟢 Saudável |
| **Tempo Total E2E** | < 10m | 🟢 Eficiente |
| **Testes Instáveis (Flaky)** | 0 | 🟢 Confiável |
| **Mutation Score** | > 75% | 🟢 Robusto |
