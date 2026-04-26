/**
 * dashboard-metrics.js
 */

/* ── Localization ────────────────────────────────── */
let currentLang = localStorage.getItem('dashboard-lang') || 'PT';

const translations = {
  PT: {
    title: "Dashboard de Qualidade",
    subtitle: "Painel central de relatórios, métricas e visão da pirâmide de testes do projeto.",
    checkingPipeline: "Verificando esteira...",
    qaEfficiencyTitle: "Eficiência de QA",
    qaEfficiencyDesc: "Métricas de impacto e retorno do processo de qualidade.",
    qaEfficiencyExpl: "A Densidade de Defeitos indica a qualidade do código por volume, o ROI mostra a economia com automação, e a Instabilidade identifica testes intermitentes.",
    defectDensity: "Densidade de Defeitos",
    automationROI: "ROI de Automação (Economia)",
    flakinessRate: "Taxa de Instabilidade (Flakiness)",
    flakyTests: "Testes instáveis",
    totalE2ETests: "Total de testes E2E",
    manual: "Manual",
    automation: "Automação",
    financialSavings: "Economia Mensal (Total):",
    totalExecuted: "Total de testes executados",
    totalFailures: "Total de Falhas",
    totalSuccess: "Total de Sucesso",
    totalNotExecuted: "Total Não Executados",
    unitWebExecuted: "Unit Web executados",
    unitWebFailures: "Falhas Unit Web",
    unitBackendExecuted: "Unit Backend executados",
    unitBackendFailures: "Falhas Unit Backend",
    unitResultsLabel: "Unitários",
    e2eResultsLabel: "E2E",
    qaEfficiencyLabel: "Eficiência",
    successRateSuiteLabel: "Gráficos",
    coverageWebLabel: "Cobertura",
    testPyramidLabel: "Pirâmide de Testes",
    overviewLabel: "Visão Geral",
    recentExecutionsLabel: "Histórico",
    apiExecuted: "Testes de API executados",
    apiFailures: "Falhas Testes de API",
    e2eExecuted: "E2E executados",
    e2eFailures: "Falhas E2E",
    covStatements: "Cobertura Web (Statements)",
    covLines: "Cobertura Web (Lines)",
    successRateSuite: "Taxa de Sucesso por Suíte",
    unitWeb: "Unit Web",
    unitBackend: "Unit Backend",
    integrationApi: "Integração API",
    e2eFrontend: "E2E Frontend",
    statements: "Statements",
    lines: "Lines",
    functions: "Functions",
    branches: "Branches",
    recentExecutions: "Execuções Recentes",
    selectDate: "Selecione uma data para ver os detalhes daquela execução.",
    showingLast7: "Mostrando últimas 7 execuções",
    qaEfficiency: "Eficiência de QA",
    impactMetrics: "Métricas de impacto e retorno do processo de qualidade.",
    coverageWeb: "Cobertura Web (Vitest)",
    unitResultsProject: "Resultados Unitários por Projeto",
    e2eResultsProject: "Resultados E2E por Projeto",
    tabSummary: "Resumo",
    tabReports: "Relatórios",
    tabMetrics: "Métricas CI",
    dynamicMetricsTitle: "Métricas Dinâmicas (CI)",
    dynamicMetricsDesc: "Esses números vêm da última execução publicada pela pipeline.",
    loadingMetrics: "Carregando métricas...",
    metricsLoaded: "Métricas carregadas com sucesso",
    noDataFound: "Nenhum dado JUnit encontrado.",
    updatedAt: "Atualizado em:",
    ciData: "Dados CI:",
    unitWebDesc: "Unidade Web (Vitest): valida componentes e regras do frontend com execução rápida e cobertura detalhada.",
    unitBackendDesc: "Unidade Backend-ts (Vitest): valida regras e serviços do backend em isolamento.",
    integrationDesc: "Integração/Contrato (Pact e API): garante compatibilidade ponta a ponta na API e contratos consumidor/provedor.",
    e2eDesc: "E2E (Playwright): verifica jornadas críticas reais em múltiplos navegadores no frontend.",
    swaggerDesc: "Documentação (Swagger): apoio para inspeção e validação manual dos endpoints.",
    covStatementsDesc: "Cobertura (Statements): percentual total de instruções/blocos executados durante os testes.",
    covLinesDesc: "Cobertura (Lines): percentual de linhas de código abrangidas pela execução dos testes.",
    testPyramid: "Pirâmide de Testes",
    testStrategy: "Estratégia de Testes",
    strategyDesc: "A estratégia prioriza muitos testes de unidade na base (rápidos e baratos), uma camada intermediária de integração/contrato, e menos testes E2E no topo para fluxos críticos.",
    e2e: "E2E",
    integrationContract: "Integração / Contrato",
    unit: "Unidade",
    legendBase: "Base: maior volume, feedback rápido.",
    legendMid: "Meio: valida integrações e contratos.",
    legendTop: "Topo: valida jornada real do usuário.",
    overview: "Visão Geral",
    testSummaryTitle: "Resumo dos Testes",
    reportsDetailedLabel: "Relatórios",
    reportsDetailedTitle: "Relatório Detalhado dos Testes",
    reportsDetailedDesc: "Use os atalhos abaixo para abrir rapidamente os resultados de cada tipo de teste.",
    pipelineLabel: "Pipeline",
    approved: "aprovados",
    totalLabel: "Total",
    statusUnavailable: "Status Indisponível",
    pipelineFailZero: "Esteira Falhou (0 Testes)",
    pipelineFail: "Esteira Falhou",
    pipelinePass: "Esteira CI: Sucesso",
    errors: "erros",
    footerText: "Dashboard publicado automaticamente via GitHub Actions · Ponto único de acesso aos resultados de qualidade.",
    historySidebarDesc: "Histórico detalhado das execuções da esteira.",
    dataNotFoundZero: "Dados não encontrados para essa execução — valores zerados.",
    errorLoadingZero: "Erro ao carregar execução — valores zerados.",
    noJUnitData: "Nenhum dado JUnit encontrado.",
    collectingData: "Coletando dados dos arquivos JUnit...",
    loadingMetricsFor: "Carregando métricas de",
    defectLeakage: "Fuga de Defeitos (Leakage)",
    automationCoverage: "Cobertura de Automação",
    escapedBugs: "Bugs Escapados (Prod)",
    detectedBugs: "Detectados em QA",
    testCycleTime: "Tempo de Ciclo de Teste",
    mttrLabel: "MTTR (Tempo de Resposta)",
    target: "Meta"
  },
  EN: {
    title: "Quality Dashboard",
    subtitle: "Central panel for reports, metrics, and project testing pyramid view.",
    checkingPipeline: "Checking pipeline...",
    qaEfficiencyTitle: "QA Efficiency",
    qaEfficiencyDesc: "Metrics on the impact and return of the quality process.",
    qaEfficiencyExpl: "Defect Density indicates code quality by volume, ROI shows the time saved through automation, and Flakiness identifies intermittent tests.",
    defectDensity: "Defect Density",
    automationROI: "Automation ROI (Savings)",
    flakinessRate: "Flakiness Rate (Instability)",
    flakyTests: "Flaky tests",
    totalE2ETests: "Total E2E tests",
    manual: "Manual",
    automation: "Automation",
    financialSavings: "Monthly Savings (Total):",
    totalExecuted: "Total tests executed",
    totalFailures: "Total Failures",
    totalSuccess: "Total Success",
    totalNotExecuted: "Total Not Executed",
    unitWebExecuted: "Unit Web executed",
    unitWebFailures: "Unit Web Failures",
    unitBackendExecuted: "Unit Backend executed",
    unitBackendFailures: "Unit Backend Failures",
    unitResultsLabel: "Unit",
    e2eResultsLabel: "E2E",
    qaEfficiencyLabel: "Efficiency",
    successRateSuiteLabel: "Charts",
    coverageWebLabel: "Coverage",
    testPyramidLabel: "Testing Pyramid",
    overviewLabel: "Overview",
    recentExecutionsLabel: "History",
    apiExecuted: "API Tests executed",
    apiFailures: "API Tests Failures",
    e2eExecuted: "E2E executed",
    e2eFailures: "E2E Failures",
    covStatements: "Web Coverage (Statements)",
    covLines: "Web Coverage (Lines)",
    successRateSuite: "Success Rate per Suite",
    unitWeb: "Unit Web",
    unitBackend: "Unit Backend",
    integrationApi: "API Integration",
    e2eFrontend: "E2E Frontend",
    statements: "Statements",
    lines: "Lines",
    functions: "Functions",
    branches: "Branches",
    recentExecutions: "Recent Executions",
    selectDate: "Select a date to view execution details.",
    showingLast7: "Showing last 7 executions",
    qaEfficiency: "QA Efficiency",
    impactMetrics: "Quality process impact and return metrics.",
    coverageWeb: "Web Coverage (Vitest)",
    unitResultsProject: "Unit Results by Project",
    e2eResultsProject: "E2E Results by Project",
    tabSummary: "Summary",
    tabReports: "Reports",
    tabMetrics: "CI Metrics",
    dynamicMetricsTitle: "Dynamic Metrics (CI)",
    dynamicMetricsDesc: "These numbers come from the last execution published by the pipeline.",
    loadingMetrics: "Loading metrics...",
    metricsLoaded: "Metrics loaded successfully",
    noDataFound: "No JUnit data found.",
    updatedAt: "Updated at:",
    ciData: "CI Data:",
    unitWebDesc: "Web Unit (Vitest): validates frontend components and rules with fast execution and detailed coverage.",
    unitBackendDesc: "Backend Unit (Vitest): validates backend rules and services in isolation.",
    integrationDesc: "Integration/Contract (Pact and API): ensures end-to-end compatibility on API and consumer/provider contracts.",
    e2eDesc: "E2E (Playwright): verifies real critical journeys across multiple frontend browsers.",
    swaggerDesc: "Documentation (Swagger): support for manual inspection and validation of endpoints.",
    covStatementsDesc: "Coverage (Statements): total percentage of instructions/blocks executed during tests.",
    covLinesDesc: "Coverage (Lines): percentage of code lines covered by test execution.",
    testPyramid: "Testing Pyramid",
    testStrategy: "Test Strategy",
    strategyDesc: "The strategy prioritizes many unit tests at the base (fast and cheap), a middle layer of integration/contract, and fewer E2E tests at the top for critical flows.",
    e2e: "E2E",
    integrationContract: "Integration / Contract",
    unit: "Unit",
    legendBase: "Base: higher volume, fast feedback.",
    legendMid: "Middle: validates integrations and contracts.",
    legendTop: "Top: validates real user journey.",
    overview: "Overview",
    testSummaryTitle: "Test Summary",
    reportsDetailedLabel: "Reports",
    reportsDetailedTitle: "Detailed Test Report",
    reportsDetailedDesc: "Use the shortcuts below to quickly open results for each test type.",
    pipelineLabel: "Pipeline",
    approved: "approved",
    totalLabel: "Total",
    statusUnavailable: "Status Unavailable",
    pipelineFailZero: "Pipeline Failed (0 Tests)",
    pipelineFail: "Pipeline Failed",
    pipelinePass: "CI Pipeline: Success",
    errors: "errors",
    footerText: "Dashboard automatically published via GitHub Actions · Single point of access for quality results.",
    historySidebarDesc: "Detailed history of pipeline executions.",
    dataNotFoundZero: "Data not found for this execution — zero values.",
    errorLoadingZero: "Error loading execution — zero values.",
    noJUnitData: "No JUnit data found.",
    collectingData: "Collecting data from JUnit files...",
    loadingMetricsFor: "Loading metrics for",
    defectLeakage: "Defect Leakage",
    automationCoverage: "Automation Coverage",
    escapedBugs: "Escaped Bugs (Prod)",
    detectedBugs: "Detected in QA",
    testCycleTime: "Test Cycle Time",
    mttrLabel: "MTTR (Response Time)",
    target: "Target"
  }
};

function applyTranslations() {
  const t = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  const langText = document.getElementById('langText');
  if (langText) langText.textContent = currentLang;
}

function toggleLanguage() {
  currentLang = currentLang === 'PT' ? 'EN' : 'PT';
  localStorage.setItem('dashboard-lang', currentLang);
  applyTranslations();
  // Re-render components that use translations
  if (window.lastMetricsData) {
    renderDynamicMetrics(window.lastMetricsData);
  }
  if (typeof renderSummaryTab === 'function') {
    renderSummaryTab();
  }
}

/* ── Runtime JUnit Parser ─────────────────────────── */

/**
 * Parses a JUnit XML string into a structured stats object.
 */
function parseJUnitXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Try <testsuites> first, then fall back to <testsuite>
  let target = xmlDoc.querySelector('testsuites');
  if (!target) target = xmlDoc.querySelector('testsuite');

  if (!target) {
    return { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, status: 'unknown' };
  }

  const tests    = safeNumber(target.getAttribute('tests'));
  const failures = safeNumber(target.getAttribute('failures'));
  const errors   = safeNumber(target.getAttribute('errors'));
  const skipped  = safeNumber(target.getAttribute('skipped'));
  const passed   = Math.max(0, tests - failures - errors - skipped);
  
  let status = 'unknown';
  if (tests > 0) {
    status = (failures === 0 && errors === 0) ? 'passed' : 'failed';
  }

  return { tests, failures, errors, skipped, passed, status };
}

// Utility to bust caches when fetching static artifacts during development.
function cacheUrl(u) {
  try {
    return `${u}${u.includes('?') ? '&' : '?'}t=${Date.now()}`;
  } catch { return u; }
}

/**
 * Fetches an XML file and parses it.
 */
async function fetchAndParseJUnit(url) {
  try {
    const res = await fetch(cacheUrl(url), { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return parseJUnitXML(text);
  } catch (e) {
    console.warn(`Failed to fetch/parse JUnit from ${url}:`, e);
    return null;
  }
}

/**
 * Parses Vitest coverage HTML for metrics.
 */
function parseCoverageHTML(htmlText) {
  if (!htmlText) return null;
  
  const extract = (metric) => {
    const regex = new RegExp(`<span\\s+class=["']strong["']>([^<]+)<\\/span>\\s*<span\\s+class=["']quiet["']>${metric}<\\/span>\\s*<span\\s+class=["']fraction["']>([^<]+)<\\/span>`, 'i');
    const match = htmlText.match(regex);
    if (!match) return { percent: null, covered: 0, total: 0 };
    
    const [covered, total] = match[2].split('/').map(v => safeNumber(v.trim()));
    const percentRaw = match[1].trim().replace('%', '');
    const percent = Number.parseFloat(percentRaw);
    
    return { percent, covered, total };
  };

  return {
    statements: extract('Statements'),
    branches:   extract('Branches'),
    functions:  extract('Functions'),
    lines:      extract('Lines')
  };
}

async function fetchAndParseCoverage(url) {
  try {
    const res = await fetch(cacheUrl(url), { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return parseCoverageHTML(text);
  } catch {
    return null;
  }
}

// Attempt to trigger server-side generation of today's snapshot (best-effort).
async function triggerGenerateIfAvailable(timeoutMs = 2500) {
  const endpoints = [
    `${reportsBaseUrl}api/generate-dashboard`,
    'http://localhost:3030/api/generate-dashboard'
  ];
  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(cacheUrl(ep), { method: 'POST', signal: controller.signal, mode: 'cors' });
      clearTimeout(timer);
      if (res && res.ok) return true;
    } catch (e) { /* ignore */ }
  }
  return false;
}

/* ── CI Badge ────────────────────────────────────── */
function renderCIBadge(data) {
  const badge = document.getElementById('ciStatusBadge');
  if (!badge) return;

  const t = translations[currentLang];
  const iconWarn = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconFail = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconPass = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  if (!data) {
    badge.className = 'ci-status unknown';
    badge.innerHTML = `${iconWarn}<span>${t.statusUnavailable || 'Status Indisponível'}</span>`;
    return;
  }

  const uw    = data?.unit?.web     ?? {};
  const ub    = data?.unit?.backend ?? {};
  const uFails = safeNumber(uw.failures) + safeNumber(uw.errors) + safeNumber(ub.failures) + safeNumber(ub.errors);
  const eFails = safeNumber(data?.e2e?.totals?.failures) + safeNumber(data?.e2e?.totals?.errors);
  const total  = safeNumber(uw.tests) + safeNumber(ub.tests) + safeNumber(data?.e2e?.totals?.tests);

  if (total === 0) {
    badge.className = 'ci-status fail';
    badge.innerHTML = `${iconWarn}<span>${t.pipelineFailZero || 'Esteira Falhou (0 Testes)'}</span>`;
  } else if (uFails > 0 || eFails > 0) {
    badge.className = 'ci-status fail';
    badge.innerHTML = `${iconFail}<span>${t.pipelineFail || 'Esteira Falhou'} (${uFails + eFails} ${t.errors || 'erros'})</span>`;
  } else {
    badge.className = 'ci-status pass';
    badge.innerHTML = `${iconPass}<span>${t.pipelinePass || 'Esteira CI: Sucesso'}</span>`;
  }
}

/* ── Number Cards ────────────────────────────────── */
function renderMetricCards(data) {
  const uw  = data?.unit?.web     ?? {};
  const ub  = data?.unit?.backend ?? {};
  const e2eT = data?.e2e?.totals  ?? {};
  const e2eP = data?.e2e?.byProject ?? {};
  const api  = e2eP['api'] || { tests: 0, passed: 0, failures: 0, errors: 0, skipped: 0 };

  const apiT      = safeNumber(api.tests);
  const apiF      = safeNumber(api.failures) + safeNumber(api.errors);
  const totalE2E  = Math.max(0, safeNumber(e2eT.tests)    - apiT);
  const totalE2EF = Math.max(0, safeNumber(e2eT.failures) + safeNumber(e2eT.errors) - apiF);

  const uwT = safeNumber(uw.tests);
  const uwF = safeNumber(uw.failures) + safeNumber(uw.errors);
  const ubT = safeNumber(ub.tests);
  const ubF = safeNumber(ub.failures) + safeNumber(ub.errors);

  const allTests = uwT + ubT + safeNumber(e2eT.tests);
  const allFails = uwF + ubF + safeNumber(e2eT.failures) + safeNumber(e2eT.errors);
  const allSkip  = safeNumber(uw.skipped) + safeNumber(ub.skipped) + safeNumber(e2eT.skipped);
  const allPass  = safeNumber(uw.passed) + safeNumber(ub.passed) + safeNumber(e2eT.passed);

  const t = translations[currentLang];
  const el = document.getElementById('metricsGrid');
  if (!el) return { uwT, uwF, ubT, ubF, apiT, apiF, totalE2E, totalE2EF };

  el.innerHTML = `
    <div class="metric highlight"><small>${t.totalExecuted}</small><strong>${allTests}</strong></div>
    <div class="metric highlight failure"><small>${t.totalFailures}</small><strong>${allFails}</strong></div>
    <div class="metric highlight success"><small>${t.totalSuccess}</small><strong>${allPass}</strong></div>
    <div class="metric highlight warning"><small>${t.totalNotExecuted}</small><strong>${allSkip}</strong></div>

    <div class="metric"><small>${t.unitWebExecuted}</small><strong>${uwT}</strong></div>
    <div class="metric"><small>${t.unitWebFailures}</small><strong>${uwF}</strong></div>
    <div class="metric"><small>${t.unitBackendExecuted}</small><strong>${ubT}</strong></div>
    <div class="metric"><small>${t.unitBackendFailures}</small><strong>${ubF}</strong></div>
    <div class="metric"><small>${t.apiExecuted}</small><strong>${apiT}</strong></div>
    <div class="metric"><small>${t.apiFailures}</small><strong>${apiF}</strong></div>
    <div class="metric"><small>${t.e2eExecuted}</small><strong>${totalE2E}</strong></div>
    <div class="metric"><small>${t.e2eFailures}</small><strong>${totalE2EF}</strong></div>
    <div class="metric"><small>${t.covStatements}</small><strong>${formatPercent(uw?.coverage?.statements?.percent)}</strong></div>
    <div class="metric"><small>${t.covLines}</small><strong>${formatPercent(uw?.coverage?.lines?.percent)}</strong></div>
  `;

  return { uwT, uwF, ubT, ubF, apiT, apiF, totalE2E, totalE2EF };
}

/* ── Donut Charts ────────────────────────────────── */
function renderDonutCharts(data, metrics) {
  const uw  = data?.unit?.web     ?? {};
  const ub  = data?.unit?.backend ?? {};
  const e2eT = data?.e2e?.totals  ?? {};
  const e2eP = data?.e2e?.byProject ?? {};
  const api  = e2eP['api'] || { tests: 0, passed: 0, failures: 0, errors: 0, skipped: 0 };

  const { uwT, uwF, ubT, ubF, apiT, apiF, totalE2E } = metrics;
  const uwS   = safeNumber(uw.skipped);
  const uwP   = Math.max(safeNumber(uw.passed)  || uwT - uwF - uwS, 0);
  const ubS   = safeNumber(ub.skipped);
  const ubP   = Math.max(safeNumber(ub.passed)  || ubT - ubF - ubS, 0);
  const apiP  = Math.max(safeNumber(api.passed), 0);
  const e2eFP = Math.max(safeNumber(e2eT.passed) - apiP, 0);

  const t = translations[currentLang];
  const el = document.getElementById('chartsGrid');
  if (!el) return { uwP, ubP, uwS, ubS };

  el.innerHTML = `
    <section class="chart-card">
      <h4>${t.successRateSuite}</h4>
      <div class="suite-donuts">
        ${renderDonut(t.unitWeb,      uwP,   uwT,       '#60a5fa')}
        ${renderDonut(t.unitBackend,  ubP,   ubT,       '#34d399')}
        ${renderDonut(t.integrationApi, Math.max(apiT - apiF - safeNumber(api.skipped), 0), apiT, '#f59e0b')}
        ${renderDonut(t.e2eFrontend,  Math.max(e2eFP, 0), totalE2E, '#ef4444')}
      </div>
    </section>
  `;

  return { uwP, ubP, uwS, ubS };
}

/* ── Coverage Bars (Vitest) ──────────────────────── */
function renderCoverageBars(data) {
  const uw  = data?.unit?.web ?? {};
  const cov = uw?.coverage ?? {};
  const t   = translations[currentLang];
  const el  = document.getElementById('coverageGrid');
  if (!el) return;

  el.innerHTML = `
    <div class="coverage-bars">
      ${renderCoverageBar(t.statements, cov?.statements?.percent)}
      ${renderCoverageBar(t.lines,      cov?.lines?.percent)}
      ${renderCoverageBar(t.functions,  cov?.functions?.percent)}
      ${renderCoverageBar(t.branches,   cov?.branches?.percent)}
    </div>
  `;
}

/* ── E2E Bar Chart ───────────────────────────────── */
function renderE2EBars(data) {
  const e2eP = data?.e2e?.byProject ?? {};
  const el = document.getElementById('e2eBars');
  if (!el) return;
  el.innerHTML =
    ['api', 'frontend-chromium', 'frontend-webkit', 'frontend-edge'].map(k => {
      const p = e2eP[k];
      if (!p) return '';
      return renderBarRow(
        E2E_PROJECT_LABELS[k] ?? k,
        safeNumber(p.passed),
        safeNumber(p.failures) + safeNumber(p.errors),
        safeNumber(p.skipped),
        safeNumber(p.tests)
      );
    }).join('');
}

/* ── Unit Tests Bar Chart ────────────────────────── */
function renderUnitBars(data) {
  const uw = data?.unit?.web ?? {};
  const ub = data?.unit?.backend ?? {};
  const el = document.getElementById('unitBars');
  if (!el) return;

  const projects = [
    { label: UNIT_PROJECT_LABELS['web'],     p: uw },
    { label: UNIT_PROJECT_LABELS['backend'], p: ub }
  ];

  el.innerHTML = projects.map(proj => {
    const { label, p } = proj;
    const t = safeNumber(p.tests);
    if (t === 0) return '';
    return renderBarRow(
      label,
      safeNumber(p.passed),
      safeNumber(p.failures) + safeNumber(p.errors),
      safeNumber(p.skipped),
      t
    );
  }).join('');
}

/* ── Timestamp Update ────────────────────────────── */
function updateTimestamp(data) {
  if (!data?.generatedAt) return;
  const d = new Date(data.generatedAt);
  if (Number.isNaN(d.getTime())) return;
  const el = document.getElementById('generatedAt');
  const t = translations[currentLang];
  const locale = currentLang === 'PT' ? 'pt-BR' : 'en-US';
  if (el) el.textContent = `${t.updatedAt} ${new Date().toLocaleString(locale)} · ${t.ciData} ${d.toLocaleString(locale)}`;
}

/**
 * Return a metrics object filled with zeros to display when a snapshot is missing.
 */
function getZeroMetrics(dateStr) {
  const gen = dateStr ? `${dateStr}T00:00:00.000Z` : new Date().toISOString();
  return {
    generatedAt: gen,
    unit: {
      web: {
        tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0,
        coverage: {
          statements: { percent: 0, covered: 0, total: 0 },
          lines:      { percent: 0, covered: 0, total: 0 },
          functions:  { percent: 0, covered: 0, total: 0 },
          branches:   { percent: 0, covered: 0, total: 0 }
        }
      },
      backend: { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 },
      totals: { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, status: 'unknown' }
    },
    e2e: { byProject: {}, totals: { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, status: 'unknown' } },
    qaEfficiency: {
      defectDensity: { bugs: 0, kloc: 0, value: 0 },
      automationROI: { manualHours: 0, automationHours: 0, savedHours: 0 },
      flakiness: { flakyTests: 0, totalE2E: 0, value: 0 }
    }
  };
}

/**
 * Compute a best-effort QA efficiency object from available runtime data.
 * Uses heuristics when exact values are not present in snapshots.
 */
function computeQAEfficiencyFromData(data) {
  const uw = data?.unit?.web ?? {};
  const ub = data?.unit?.backend ?? {};
  const e2eTotals = data?.e2e?.totals ?? {};

  const totalE2E = safeNumber(e2eTotals.tests) || Object.values(data?.e2e?.byProject || {}).reduce((s, p) => s + safeNumber(p.tests), 0);

  const uwF = safeNumber(uw.failures) + safeNumber(uw.errors);
  const ubF = safeNumber(ub.failures) + safeNumber(ub.errors);
  const e2eF = safeNumber(e2eTotals.failures) + safeNumber(e2eTotals.errors);
  const allFails = uwF + ubF + e2eF;

  // Defect density heuristic: try to use coverage lines total as proxy for KLOC
  const linesTotal = safeNumber(uw?.coverage?.lines?.total);
  const kloc = linesTotal > 0 ? Math.max(0.1, +(linesTotal / 1000).toFixed(1)) : 0;
  const bugs = allFails > 0 ? Math.max(1, Math.round(allFails / 10)) : 0;
  const defectValue = kloc > 0 ? +(bugs / kloc).toFixed(2) : 0;

  // Flakiness: sum any 'flaky' counters from e2e byProject if available
  const flakyFromProjects = Object.values(data?.e2e?.byProject || {}).reduce((s, p) => s + safeNumber(p.flaky || 0), 0);
  const flakyTests = flakyFromProjects || 0;
  const flakinessValue = totalE2E > 0 ? +(flakyTests / totalE2E * 100) : 0;

  // Automation ROI heuristic: hours per E2E test (manual vs automated)
  // New Rules: Manual = 3min, Auto = 0.2min, Parallelism = 2
  const manualPerTest = 3 / 60;   // 0.05h
  const autoPerTest = (0.2 / 60) / 2; // 0.001666h (parallelized)
  const manualHours = +(totalE2E * manualPerTest).toFixed(2);
  const automationHours = +(totalE2E * autoPerTest).toFixed(2);
  const savedHours = +(manualHours - automationHours).toFixed(2);

  // Extended heuristics for new fields
  const escapedToProduction = 0; // default for heuristic
  const detectedInQA = bugs;
  const leakageRate = bugs > 0 ? +(escapedToProduction / (escapedToProduction + bugs) * 100).toFixed(1) : 0;
  
  const automated = totalE2E;
  const manual = Math.round(totalE2E * 0.15); // guess 15% manual
  const totalTestCases = automated + manual;
  const coveragePercent = totalTestCases > 0 ? +(automated / totalTestCases * 100).toFixed(1) : 0;

  return {
    defectDensity: { bugs, kloc, value: defectValue },
    automationROI: { manualHours, automationHours, savedHours, hourlyRate: 60 },
    flakiness: { flakyTests, totalE2E, value: flakinessValue },
    defectLeakage: { escapedToProduction, detectedInQA, leakageRate },
    testAutomationCoverage: { automated, manual, coveragePercent, totalTestCases },
    mttr: { meanTimeToRepair: 0 }
  };
}

/* ── Grand Totals (Resumo tab) ───────────────────── */
function computeAndUpdateGrandTotals(data) {
  const uw  = data?.unit?.web     ?? {};
  const ub  = data?.unit?.backend ?? {};
  const e2eT = data?.e2e?.totals    ?? {};
  const e2eP = data?.e2e?.byProject ?? {};
  const api  = e2eP['api'] || { passed: 0, failures: 0, errors: 0, skipped: 0 };

  const uwF = safeNumber(uw.failures) + safeNumber(uw.errors);
  const ubF = safeNumber(ub.failures) + safeNumber(ub.errors);
  const uwS = safeNumber(uw.skipped);
  const ubS = safeNumber(ub.skipped);
  const uwT = safeNumber(uw.tests);
  const ubT = safeNumber(ub.tests);
  const uwP = Math.max(safeNumber(uw.passed) || uwT - uwF - uwS, 0);
  const ubP = Math.max(safeNumber(ub.passed) || ubT - ubF - ubS, 0);

  const apiP = Math.max(safeNumber(api.passed), 0);
  const apiF = safeNumber(api.failures) + safeNumber(api.errors);
  const totalE2EF = Math.max(0, safeNumber(e2eT.failures) + safeNumber(e2eT.errors) - apiF);

  const grandPassed = safeNumber(uwP + ubP + safeNumber(e2eT.passed));
  const grandFailed = safeNumber(uwF + ubF + safeNumber(e2eT.failures) + safeNumber(e2eT.errors));

  updateSummaryTotals(grandPassed, grandFailed);
}

function renderQAEfficiency(data) {
  const eff = data?.qaEfficiency ?? computeQAEfficiencyFromData(data);

  const grid = document.getElementById('qaEfficiencyGrid');
  if (!grid) return;

  const t = translations[currentLang];
  const dd = eff.defectDensity;
  const roi = eff.automationROI;
  const flaky = eff.flakiness || { flakyTests: 0, totalE2E: 0, value: 0 };
  const leakage = eff.defectLeakage || { escapedToProduction: 0, detectedInQA: 0, leakageRate: 0 };
  const coverage = eff.testAutomationCoverage || { automated: 0, manual: 0, coveragePercent: 0 };
  const mttr = eff.mttr || { meanTimeToRepair: 0 };
  
  const count = window.totalExecutionsCount || 1;
  const hourlyRate = roi.hourlyRate || 60;
  
  const totalSavedHours = +(roi.savedHours * count).toFixed(1);
  const totalManualHours = +(roi.manualHours * count).toFixed(1);
  const totalAutomationHours = +(roi.automationHours * count).toFixed(1);
  const financialSavings = totalSavedHours * hourlyRate;
  
  const flakinessValue = flaky.value || (flaky.totalE2E > 0 ? (flaky.flakyTests / flaky.totalE2E) * 100 : 0);

  grid.innerHTML = `
    <div class="metric highlight success">
      <small>${t.defectDensity}</small>
      <strong>${dd.value.toFixed(2)}</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">${dd.bugs} bugs / ${dd.kloc} KLOC</p>
    </div>
    
    <div class="metric highlight warning">
      <small>${t.flakinessRate}</small>
      <strong>${flakinessValue.toFixed(1)}%</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">${flaky.flakyTests} ${t.flakyTests} / ${flaky.totalE2E} E2E</p>
    </div>

    <div class="metric highlight success">
      <small>${t.automationROI}</small>
      <strong>${totalSavedHours}h</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">${t.manual}: ${totalManualHours}h | ${t.automation}: ${totalAutomationHours}h</p>
      <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); font-size:0.85rem;">
        <div style="color:var(--ok); margin-bottom:4px;">💰 ${t.financialSavings}</div>
        <div style="font-size:1.4rem; font-weight:800; color:#4ade80;">R$ ${financialSavings.toLocaleString('pt-BR')}</div>
        <small style="opacity:0.6; font-size:0.65rem;">(Base: R$ ${hourlyRate}/h × ${count} exec.)</small>
      </div>
    </div>

    <div class="metric highlight ${leakage.leakageRate > 5 ? 'failure' : 'success'}">
      <small>${t.defectLeakage}</small>
      <strong>${leakage.leakageRate.toFixed(1)}%</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">${leakage.escapedToProduction} Prod / ${leakage.detectedInQA} QA</p>
    </div>

    <div class="metric highlight info">
      <small>${t.automationCoverage}</small>
      <strong>${coverage.coveragePercent.toFixed(1)}%</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">${coverage.automated} auto / ${coverage.totalTestCases || (coverage.automated + coverage.manual)} total</p>
    </div>

    <div class="metric highlight info">
      <small>${t.mttrLabel}</small>
      <strong>${mttr.meanTimeToRepair}h</strong>
      <p style="font-size:0.7rem; margin-top:4px; opacity:0.7">Avg time to repair bugs</p>
    </div>

    <p class="muted" style="grid-column: 1 / -1; font-size: 0.85rem; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 10px;">
      💡 <strong>${t.qaEfficiencyTitle}:</strong> ${t.qaEfficiencyExpl}
    </p>
  `;
}

/* ── Main Metrics Renderer ───────────────────────── */
function renderDynamicMetrics(data) {
  window.lastMetricsData = data; // Store for re-rendering on lang change
  const dynamicStatus = document.getElementById('dynamicStatus');
  const t = translations[currentLang];
  if (dynamicStatus) {
    dynamicStatus.className   = 'status-pill success';
    dynamicStatus.textContent = t.metricsLoaded;
  }

  const metrics = renderMetricCards(data);
  renderQAEfficiency(data);
  renderDonutCharts(data, metrics);

  renderCoverageBars(data);
  renderE2EBars(data);
  renderUnitBars(data);
  computeAndUpdateGrandTotals(data);
  updateTimestamp(data);
  applyTranslations(); // Ensure static texts are updated
}

/* ── Data Loader ─────────────────────────────────── */
async function loadDynamicMetrics() {
  const dynamicStatus = document.getElementById('dynamicStatus');
  const t = translations[currentLang];
  if (dynamicStatus) {
    dynamicStatus.className = 'status-pill info';
    dynamicStatus.textContent = t.collectingData || 'Coletando dados...';
  }

  // Try to load recent historical snapshots (dates.json) and present a date filter
  async function fetchAndRenderHistoric(dateStr) {
    const dynamicStatusLocal = document.getElementById('dynamicStatus');
    if (dynamicStatusLocal) {
      dynamicStatusLocal.className = 'status-pill info';
      dynamicStatusLocal.textContent = `${t.loadingMetricsFor || 'Carregando métricas de'} ${dateStr}...`;
    }
    try {
      const res = await fetch(cacheUrl(`${reportsBaseUrl}history/${dateStr}.json`), { cache: 'no-store' });
      if (!res.ok) throw new Error('not found');
      const json = await res.json();
      renderDynamicMetrics(json);
      renderCIBadge(json);
      return true;
    } catch (e) {
      console.warn('Historic metrics not available for', dateStr, e);
      return false;
    }
  }

  try {
    // Best-effort: trigger server-side generator so that today's snapshot exists
    try { await triggerGenerateIfAvailable(2000); } catch {}
    const datesRes = await fetch(cacheUrl(`${reportsBaseUrl}history/dates.json`), { cache: 'no-store' });
    if (datesRes.ok) {
      const dates = await datesRes.json();
      if (Array.isArray(dates) && dates.length > 0) {
        window.totalExecutionsCount = dates.length;
        const listEl = document.getElementById('historyList');
        const sidebar = document.getElementById('historySidebar');
        if (listEl && sidebar) {
          listEl.innerHTML = '';
          const t = translations[currentLang];
          const foot = sidebar.querySelector('.sidebar-foot');
          if (foot) foot.textContent = t.showingLast7;

          // Sort dates descending (newest first)
          dates.sort((a, b) => b.localeCompare(a));

          // Fetch snapshots in parallel to enrich the sidebar with status/summary
          // Show up to 7 recent dates in the sidebar
          const snapshots = await Promise.all(dates.slice(0, 7).map(async (d) => {
            try {
              const r = await fetch(cacheUrl(`${reportsBaseUrl}history/${d}.json`), { cache: 'no-store' });
              if (!r.ok) return { date: d, metrics: null };
              const json = await r.json();
              return { date: d, metrics: json };
            } catch (e) {
              return { date: d, metrics: null };
            }
          }));

          snapshots.forEach((snap) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.dataset.date = snap.date;

            const dateDisplay = (() => {
              try { 
                // Prioritize parsing the ID if it matches the new format YYYY-MM-DD-HHhMMm
                const idMatch = snap.date.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})h(\d{2})m$/);
                if (idMatch) {
                  const [_, datePart, hour, min] = idMatch;
                  const [y, m, d] = datePart.split('-');
                  return `${d}/${m}/${y} ${hour}h${min}m`;
                }

                if (snap.metrics?.generatedAt) {
                  const d = new Date(snap.metrics.generatedAt);
                  const hh = d.getHours().toString().padStart(2, '0');
                  const mm = d.getMinutes().toString().padStart(2, '0');
                  const locale = currentLang === 'PT' ? 'pt-BR' : 'en-US';
                  return d.toLocaleDateString(locale) + ` ${hh}h${mm}m`;
                }
                // Fallback para quando não tem timestamp (usa snap.date)
                const locale = currentLang === 'PT' ? 'pt-BR' : 'en-US';
                return new Date(snap.date.slice(0, 10) + 'T00:00:00').toLocaleDateString(locale); 
              } catch { return snap.date; }
            })();

            // Determine a simple overall status (unit totals + e2e totals)
            let status = 'unknown';
            try {
              const unitStatus = snap.metrics?.unit?.totals?.status;
              const e2eStatus = snap.metrics?.e2e?.totals?.status;
              if (unitStatus === 'passed' && (e2eStatus === 'passed' || e2eStatus === undefined)) status = 'passed';
              else if (unitStatus === 'failed' || e2eStatus === 'failed') status = 'failed';
            } catch { status = 'unknown'; }
            // Minimal list item: only date and a colored dot status (no numbers/coverage text)
            li.innerHTML = `
              <div class="h-left">
                <div class="h-date">${dateDisplay}</div>
              </div>
              <div class="h-right">
                <span class="h-dot ${status}" title="${status}"></span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="chev" style="margin-left:8px"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            `;

            // keyboard accessibility
            li.setAttribute('role', 'button');
            li.tabIndex = 0;
            li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); li.click(); } });
            li.addEventListener('click', async () => {
              // Clear any previous visual state
              document.querySelectorAll('.history-item').forEach(e => {
                e.classList.remove('active');
                e.classList.remove('disabled');
                e.setAttribute('aria-disabled', 'false');
                e.tabIndex = 0;
              });

              // Visually dim the non-selected items but keep them clickable
              document.querySelectorAll('.history-item').forEach(e => {
                if (e !== li) {
                  e.classList.add('disabled');
                  e.setAttribute('aria-disabled', 'true');
                }
              });

              // Activate this item visually
              li.classList.add('active');

              try {
                if (snap.metrics) {
                  renderDynamicMetrics(snap.metrics);
                  renderCIBadge(snap.metrics);
                } else {
                  const ok = await fetchAndRenderHistoric(snap.date);
                  if (!ok) {
                    // Show zeroed metrics when snapshot not available
                    const zero = getZeroMetrics(snap.date);
                    renderDynamicMetrics(zero);
                    renderCIBadge(zero);
                    const ds = document.getElementById('dynamicStatus');
                    if (ds) { ds.className = 'status-pill warning'; ds.textContent = t.dataNotFoundZero; }
                  }
                }
              } catch (err) {
                console.error('Error loading history snapshot', err);
                const zero = getZeroMetrics(snap.date);
                renderDynamicMetrics(zero);
                renderCIBadge(zero);
                const ds = document.getElementById('dynamicStatus');
                if (ds) { ds.className = 'status-pill warning'; ds.textContent = t.errorLoadingZero; }
              }
            });

            listEl.appendChild(li);
          });

          // Select first item by default
          // Exposed helper to reset view to latest
          window.selectLatestHistoryItem = () => {
            const first = listEl.querySelector('.history-item');
            if (first) first.click();
          };

          const first = listEl.querySelector('.history-item');
          if (first) first.click();
          return;
        }
      }
    }
  } catch (e) {
    // ignore and fallback to live parsing
  }

  // Define candidate paths for runtime data gathering
  const paths = {
    unitWeb:     [`${reportsBaseUrl}unit-tests-web/junit.xml`],
    unitBackend: [`${reportsBaseUrl}unit-tests-backend/junit.xml`],
    coverage:    `${reportsBaseUrl}unit-tests-web/coverage/index.html`,
    e2e: {
      'api':               `${reportsBaseUrl}e2e-junit-api/junit-report.xml`,
      'frontend-chromium': `${reportsBaseUrl}e2e-junit-frontend-chromium/junit-report.xml`,
      'frontend-webkit':   `${reportsBaseUrl}e2e-junit-frontend-webkit/junit-report.xml`,
      'frontend-edge':     `${reportsBaseUrl}e2e-junit-frontend-edge/junit-report.xml`
    }
  };

  // 1. Fetch and parse everything in parallel
  const [xmlWeb, xmlBackend, covHtml, ...e2eXmls] = await Promise.all([
    fetchAndParseJUnit(paths.unitWeb[0]),
    fetchAndParseJUnit(paths.unitBackend[0]),
    fetchAndParseCoverage(paths.coverage),
    ...Object.values(paths.e2e).map(url => fetchAndParseJUnit(url))
  ]);

  // 2. Build the data structure at runtime
  const e2eprojects = {};
  Object.keys(paths.e2e).forEach((key, idx) => {
    if (e2eXmls[idx]) {
      e2eprojects[key] = e2eXmls[idx];
    }
  });

  const e2eTotals = Object.values(e2eprojects).reduce(
    (acc, cur) => {
      acc.tests += cur.tests;
      acc.failures += cur.failures;
      acc.errors += cur.errors;
      acc.skipped += cur.skipped;
      acc.passed += cur.passed;
      return acc;
    },
    { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 }
  );

  const runtimeData = {
    generatedAt: new Date().toISOString(),
    unit: {
      web: xmlWeb ? { ...xmlWeb, coverage: covHtml } : null,
      backend: xmlBackend
    },
    e2e: {
      byProject: e2eprojects,
      totals: {
        ...e2eTotals,
        status: e2eTotals.tests > 0 && e2eTotals.failures === 0 && e2eTotals.errors === 0 ? 'passed' : 'failed'
      }
    }
  };

  // Best-effort: enrich E2E counters from Playwright reports (may populate 'flaky')
  let enrichedData = runtimeData;
  try {
    if (typeof enrichE2EFromPlaywrightReports === 'function') {
      enrichedData = await enrichE2EFromPlaywrightReports(runtimeData);
    }
  } catch (err) {
    // ignore enrichment errors and keep runtimeData
    enrichedData = runtimeData;
  }

  // Ensure QA efficiency block exists (compute heuristics if not present)
  if (!enrichedData.qaEfficiency) {
    enrichedData.qaEfficiency = computeQAEfficiencyFromData(enrichedData);
  }

  // 3. Fallback to existing JSON or Embedded Mock if all fetches failed
  if (!xmlWeb && !xmlBackend && e2eTotals.tests === 0) {
    try {
      const res = await fetch(cacheUrl(`${reportsBaseUrl}dashboard-metrics.json`), { cache: 'no-store' });
      if (res.ok) {
        const jsonData = await res.json();
        renderDynamicMetrics(jsonData);
        renderCIBadge(jsonData);
        return;
      }
    } catch {}

    if (window.DASHBOARD_METRICS_FALLBACK) {
      renderDynamicMetrics(window.DASHBOARD_METRICS_FALLBACK);
      renderCIBadge(window.DASHBOARD_METRICS_FALLBACK);
    } else {
      if (dynamicStatus) {
        dynamicStatus.className = 'status-pill warning';
        dynamicStatus.textContent = t.noJUnitData;
      }
      renderCIBadge(null);
    }
    return;
  }

  // 4. Render the gathered/enriched data
  renderDynamicMetrics(enrichedData);
  renderCIBadge(enrichedData);

  // Listener para garantir que o snapshot mais recente seja exibido ao clicar na aba de métricas
  const tabMetrics = document.getElementById('tab-metrics');
  if (tabMetrics) {
    tabMetrics.addEventListener('click', () => {
      const listEl = document.getElementById('historyList');
      if (listEl) {
        const first = listEl.querySelector('.history-item');
        if (first) {
          first.click();
        }
      }
    });
  }
}

/* ── Initialization ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup language toggle
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', toggleLanguage);
  }
  applyTranslations();

  // 2. Load metrics
  loadDynamicMetrics();
});
