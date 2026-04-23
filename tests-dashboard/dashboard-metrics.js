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

  const el = document.getElementById('metricsGrid');
  if (!el) return { uwT, uwF, ubT, ubF, apiT, apiF, totalE2E, totalE2EF };

  el.innerHTML = `
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

  const el = document.getElementById('chartsGrid');
  if (!el) return { uwP, ubP, uwS, ubS };

  el.innerHTML = `
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
  const el = document.getElementById('e2eBars');
  if (!el) return;
  el.innerHTML =
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
  if (el) el.textContent = `Atualizado em: ${new Date().toLocaleString('pt-BR')} · Dados CI: ${d.toLocaleString('pt-BR')}`;
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
    e2e: { byProject: {}, totals: { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, status: 'unknown' } }
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

  const grandPassed = safeNumber(uwP + ubP + apiP + Math.max(safeNumber(e2eT.passed), 0));
  const grandFailed = safeNumber(uwF + ubF + apiF + totalE2EF);

  updateSummaryTotals(grandPassed, grandFailed);
}

/* ── Main Metrics Renderer ───────────────────────── */
function renderDynamicMetrics(data) {
  const dynamicStatus = document.getElementById('dynamicStatus');
  if (dynamicStatus) {
    dynamicStatus.className   = 'status-pill success';
    dynamicStatus.textContent = 'Métricas carregadas com sucesso';
  }

  const metrics = renderMetricCards(data);
  renderDonutCharts(data, metrics);

  renderCoverageBars(data);
  renderE2EBars(data);
  renderUnitBars(data);
  computeAndUpdateGrandTotals(data);
  updateTimestamp(data);
}

/* ── Data Loader ─────────────────────────────────── */
async function loadDynamicMetrics() {
  const dynamicStatus = document.getElementById('dynamicStatus');
  if (dynamicStatus) {
    dynamicStatus.className = 'status-pill info';
    dynamicStatus.textContent = 'Coletando dados dos arquivos JUnit...';
  }

  // Try to load recent historical snapshots (dates.json) and present a date filter
  async function fetchAndRenderHistoric(dateStr) {
    const dynamicStatusLocal = document.getElementById('dynamicStatus');
    if (dynamicStatusLocal) {
      dynamicStatusLocal.className = 'status-pill info';
      dynamicStatusLocal.textContent = `Carregando métricas de ${dateStr}...`;
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
        const listEl = document.getElementById('historyList');
        const sidebar = document.getElementById('historySidebar');
        if (listEl && sidebar) {
          listEl.innerHTML = '';
          const foot = sidebar.querySelector('.sidebar-foot');
          if (foot) foot.textContent = 'Mostrando últimas 5 execuções';

          // Sort dates descending (newest first)
          dates.sort((a, b) => b.localeCompare(a));

          // Fetch snapshots in parallel to enrich the sidebar with status/summary
          // Show up to 5 recent dates in the sidebar
          const snapshots = await Promise.all(dates.slice(0, 5).map(async (d) => {
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
                // Adicionamos T00:00:00 para evitar o shift de timezone (UTC vs Local)
                return new Date(snap.date + 'T00:00:00').toLocaleDateString('pt-BR'); 
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
                    if (ds) { ds.className = 'status-pill warning'; ds.textContent = 'Dados não encontrados para essa execução — valores zerados.'; }
                  }
                }
              } catch (err) {
                console.error('Error loading history snapshot', err);
                const zero = getZeroMetrics(snap.date);
                renderDynamicMetrics(zero);
                renderCIBadge(zero);
                const ds = document.getElementById('dynamicStatus');
                if (ds) { ds.className = 'status-pill warning'; ds.textContent = 'Erro ao carregar execução — valores zerados.'; }
              }
            });

            listEl.appendChild(li);
          });

          // Select first item by default
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
        dynamicStatus.textContent = 'Nenhum dado JUnit encontrado.';
      }
      renderCIBadge(null);
    }
    return;
  }

  // 4. Render the gathered data
  renderDynamicMetrics(runtimeData);
  renderCIBadge(runtimeData);

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

document.addEventListener('DOMContentLoaded', loadDynamicMetrics);
