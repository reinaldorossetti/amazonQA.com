/**
 * dashboard-metrics.js
 * Renders the "Métricas CI" tab:
 *   - CI status badge
 *   - Dynamic metric number cards
 *   - Donut charts (success rate by suite)
 *   - Coverage bars (Vitest web)
 *   - E2E bar chart by project
 *   - Unit Tests bar chart by project  ← NEW
 *
 * Depends on: dashboard-utils.js, dashboard-summary.js
 */

/* ── CI Badge ────────────────────────────────────── */
function renderCIBadge(data) {
  const badge = document.getElementById('ciStatusBadge');
  if (!badge) return;

  const iconWarn = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconFail = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconPass = `<svg class="ci-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  if (!data) {
    badge.className = 'ci-status unknown';
    badge.innerHTML = `${iconWarn}<span>Status Indisponível</span>`;
    return;
  }

  const uw    = data?.unit?.web     ?? {};
  const ub    = data?.unit?.backend ?? {};
  const uFails = safeNumber(uw.failures) + safeNumber(uw.errors) + safeNumber(ub.failures) + safeNumber(ub.errors);
  const eFails = safeNumber(data?.e2e?.totals?.failures) + safeNumber(data?.e2e?.totals?.errors);
  const total  = safeNumber(uw.tests) + safeNumber(ub.tests) + safeNumber(data?.e2e?.totals?.tests);

  if (total === 0) {
    badge.className = 'ci-status fail';
    badge.innerHTML = `${iconWarn}<span>Esteira Falhou (0 Testes)</span>`;
  } else if (uFails > 0 || eFails > 0) {
    badge.className = 'ci-status fail';
    badge.innerHTML = `${iconFail}<span>Esteira Falhou (${uFails + eFails} erros)</span>`;
  } else {
    badge.className = 'ci-status pass';
    badge.innerHTML = `${iconPass}<span>Esteira CI: Sucesso</span>`;
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

  document.getElementById('metricsGrid').innerHTML = `
    <div class="metric"><small>Unit Web executados</small><strong>${uwT}</strong></div>
    <div class="metric"><small>Falhas Unit Web</small><strong>${uwF}</strong></div>
    <div class="metric"><small>Unit Backend executados</small><strong>${ubT}</strong></div>
    <div class="metric"><small>Falhas Unit Backend</small><strong>${ubF}</strong></div>
    <div class="metric"><small>Testes de API executados</small><strong>${apiT}</strong></div>
    <div class="metric"><small>Falhas Testes de API</small><strong>${apiF}</strong></div>
    <div class="metric"><small>E2E executados</small><strong>${totalE2E}</strong></div>
    <div class="metric"><small>Falhas E2E</small><strong>${totalE2EF}</strong></div>
    <div class="metric"><small>Cobertura Web (Statements)</small><strong>${formatPercent(uw?.coverage?.statements?.percent)}</strong></div>
    <div class="metric"><small>Cobertura Web (Lines)</small><strong>${formatPercent(uw?.coverage?.lines?.percent)}</strong></div>
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

  document.getElementById('chartsGrid').innerHTML = `
    <section class="chart-card">
      <h4>Taxa de Sucesso por Suíte</h4>
      <div class="suite-donuts">
        ${renderDonut('Unit Web',      uwP,   uwT,       '#60a5fa')}
        ${renderDonut('Unit Backend',  ubP,   ubT,       '#34d399')}
        ${renderDonut('Integração API',Math.max(apiT - apiF - safeNumber(api.skipped), 0), apiT, '#f59e0b')}
        ${renderDonut('E2E Frontend',  Math.max(e2eFP, 0), totalE2E, '#ef4444')}
      </div>
    </section>
  `;

  return { uwP, ubP, uwS, ubS };
}

/* ── Coverage Bars (Vitest) ──────────────────────── */
function renderCoverageBars(data) {
  const uw  = data?.unit?.web ?? {};
  const cov = uw?.coverage ?? {};
  const el  = document.getElementById('coverageGrid');
  if (!el) return;

  el.innerHTML = `
    <div class="coverage-bars">
      ${renderCoverageBar('Statements', cov?.statements?.percent)}
      ${renderCoverageBar('Lines',      cov?.lines?.percent)}
      ${renderCoverageBar('Functions',  cov?.functions?.percent)}
      ${renderCoverageBar('Branches',   cov?.branches?.percent)}
    </div>`;
}

/* ── E2E Bar Chart ───────────────────────────────── */
function renderE2EBars(data) {
  const e2eP = data?.e2e?.byProject ?? {};
  document.getElementById('e2eBars').innerHTML =
    ['api', 'frontend-chromium', 'frontend-edge'].map(k => {
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
function renderUnitBars(data, { uwP, uwT, ubP, ubT, uwF, ubF, uwS, ubS }) {
  document.getElementById('unitBars').innerHTML = [
    renderBarRow(UNIT_PROJECT_LABELS['web'],     uwP, uwF, uwS, uwT),
    renderBarRow(UNIT_PROJECT_LABELS['backend'], ubP, ubF, ubS, ubT)
  ].join('');
}

/* ── Timestamp Update ────────────────────────────── */
function updateTimestamp(data) {
  if (!data?.generatedAt) return;
  const d = new Date(data.generatedAt);
  if (Number.isNaN(d.getTime())) return;
  const el = document.getElementById('generatedAt');
  if (el) el.textContent = `Atualizado em: ${new Date().toLocaleString('pt-BR')} · Dados CI: ${d.toLocaleString('pt-BR')}`;
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

  const grandPassed = safeNumber(uwP + ubP + apiP + Math.max(safeNumber(e2eT.passed), 0));
  const grandFailed = safeNumber(uwF + ubF + apiF + totalE2EF);

  updateSummaryTotals(grandPassed, grandFailed);
}

/* ── Main Metrics Renderer ───────────────────────── */
function renderDynamicMetrics(data) {
  const dynamicStatus = document.getElementById('dynamicStatus');
  dynamicStatus.className   = 'status-pill success';
  dynamicStatus.textContent = 'Métricas carregadas com sucesso';

  const metrics = renderMetricCards(data);         // { uwT, uwF, ubT, ubF, apiT, apiF, totalE2E, totalE2EF }
  const donuts  = renderDonutCharts(data, metrics); // { uwP, ubP, uwS, ubS }

  // Merge both result objects so every downstream function has full context
  const allMetrics = { ...metrics, ...donuts };

  renderCoverageBars(data);
  renderE2EBars(data);
  renderUnitBars(data, allMetrics);
  computeAndUpdateGrandTotals(data);
  updateTimestamp(data);
}

/* ── Data Loader ─────────────────────────────────── */
async function loadDynamicMetrics() {
  const dynamicStatus = document.getElementById('dynamicStatus');

  /**
   * Try to fetch the JSON from the server (works on GitHub Pages / HTTP).
   * If that fails (CORS on file://, 404, network error), fall back to the
   * locally-embedded data in dashboard-metrics-data.js.
   */
  let data = null;
  try {
    const res = await fetch(`${reportsBaseUrl}dashboard-metrics.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch {
    // Graceful fallback: use the locally embedded simulation data
    if (window.DASHBOARD_METRICS_FALLBACK) {
      data = window.DASHBOARD_METRICS_FALLBACK;
    }
  }

  if (!data) {
    dynamicStatus.className   = 'status-pill warning';
    dynamicStatus.textContent = 'Métricas dinâmicas indisponíveis nesta publicação.';
    document.getElementById('metricsGrid').innerHTML  = '';
    document.getElementById('chartsGrid').innerHTML   = '';
    document.getElementById('e2eBars').innerHTML      = '';
    document.getElementById('unitBars').innerHTML     = '';
    document.getElementById('coverageGrid').innerHTML = '';
    renderCIBadge(null);
    return;
  }

  // Enrich E2E data from live Playwright reports (best-effort; falls back to JSON values)
  const enriched = await enrichE2EFromPlaywrightReports(data);
  renderDynamicMetrics(enriched);
  renderCIBadge(enriched);
}

document.addEventListener('DOMContentLoaded', loadDynamicMetrics);
