/**
 * dashboard-utils.js
 * Shared utilities, constants, and data for the QA Dashboard.
 */

/* ── Math / Formatting Helpers ───────────────────── */
const safeNumber  = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const safePercent = (p, t) => t <= 0 ? 0 : Math.max(0, Math.min(100, (p / t) * 100));
const formatPercent = v => typeof v !== 'number' || Number.isNaN(v) ? 'N/D' : `${v.toFixed(1)}%`;

/* ── Reports Data ────────────────────────────────── */
const reportsBaseUrl = new URL('./reports/', window.location.href).href;

const REPORTS = [
  { title: 'E2E - Frontend Chromium',    type: 'E2E',                   description: 'Fluxos ponta a ponta no Chromium.',                                           href: `${reportsBaseUrl}playwright-report-frontend-chromium/` },
  { title: 'E2E - Frontend Webkit',      type: 'E2E',                   description: 'Fluxos ponta a ponta no Safari/Webkit.',                                      href: `${reportsBaseUrl}playwright-report-frontend-webkit/` },
  { title: 'E2E - Frontend Edge',        type: 'E2E',                   description: 'Fluxos ponta a ponta no Edge.',                                               href: `${reportsBaseUrl}playwright-report-frontend-edge/` },
  { title: 'E2E - Selenium Chrome',      type: 'E2E',                   description: 'Relatório Allure dos testes Selenium no Chrome.',                              href: `${reportsBaseUrl}selenium-allure-report-chrome/` },
  { title: 'E2E - Selenium Firefox',     type: 'E2E',                   description: 'Relatório Allure dos testes Selenium no Firefox.',                             href: `${reportsBaseUrl}selenium-allure-report-firefox/` },
  { title: 'Integração - API',           type: 'Integração/Contrato',   description: 'Cenários de integração da API.',                                              href: `${reportsBaseUrl}playwright-report-api/` },
  { title: 'Integração - REST Assured',  type: 'Integração/Contrato',   description: 'Suíte Java REST Assured (espelho dos specs Playwright API).',                 href: `${reportsBaseUrl}rest-assured-allure-report/` },
  { title: 'Contrato - Pact',            type: 'Integração/Contrato',   description: 'Validação de contrato consumidor/provedor.',                                  href: `${reportsBaseUrl}contract-tests/pacts/tester-web-frontend-tester-backend-api.json` },
  { title: 'Unit Web - Coverage',        type: 'Unidade',               description: 'Cobertura e status dos testes unitários do frontend web (Vitest).',          href: `${reportsBaseUrl}unit-tests-web/coverage/index.html` },
  { title: 'Unit Web - JUnit XML',       type: 'Unidade',               description: 'Saída bruta de execução dos testes unitários do web.',                       href: `${reportsBaseUrl}unit-tests-web/junit.xml` },
  { title: 'Unit Backend-ts - JUnit XML',type: 'Unidade',               description: 'Saída bruta de execução dos testes unitários do backend-ts.',                href: `${reportsBaseUrl}unit-tests-backend/junit.xml` },
  { title: 'Mobile Android (All Tests)', type: 'Mobile',                description: 'Resultados consolidados dos testes unitários (Robolectric) e instrumentados (Espresso).', href: `${reportsBaseUrl}e2e-junit-mobile-android/` },
  { title: 'Mobile Android - Allure HTML', type: 'Mobile',              description: 'Relatório visual Allure dos testes mobile (unitários e instrumentados).',    href: `${reportsBaseUrl}mobile-allure-report/index.html` },
  { title: 'Mobile Android - Allure Raw', type: 'Mobile',               description: 'Arquivos brutos do Allure (JSON/attachments) para auditoria e reprocessamento.', href: `${reportsBaseUrl}mobile-allure-results/` },
  { title: 'Swagger API',                type: 'Documentação',          description: 'Documentação interativa dos endpoints.',                                      href: `${reportsBaseUrl}swagger/index.html` }
];

const TEST_SUMMARY_ITEMS = [
  'unitWebDesc',
  'unitBackendDesc',
  'integrationDesc',
  'e2eDesc',
  'swaggerDesc',
  'covStatementsDesc',
  'covLinesDesc'
];

const E2E_PROJECT_LABELS = {
  'frontend-chromium': 'E2E Frontend Chromium',
  'frontend-webkit':   'E2E Frontend Webkit',
  'frontend-edge':     'E2E Frontend Edge',
  'api':               'Integração API (Playwright)',
  'api-rest-assured':  'Integração API (REST Assured)',
  'mobile-android':    'Mobile Android (Unit + UI)'
};

const UNIT_PROJECT_LABELS = {
  'web':     'Unit Web (Vitest)',
  'backend': 'Unit Backend-ts (Vitest)',
  'mobile-android': 'Mobile Android (Unit)'
};

const PLAYWRIGHT_REPORT_SOURCES = {
  'frontend-chromium': `${reportsBaseUrl}playwright-report-frontend-chromium/`,
  'frontend-webkit':   `${reportsBaseUrl}playwright-report-frontend-webkit/`,
  'frontend-edge':     `${reportsBaseUrl}playwright-report-frontend-edge/`,
  'api':               `${reportsBaseUrl}playwright-report-api/`
};

/* ── HTML Render Helpers ─────────────────────────── */

/**
 * Renders a donut chart for suite success rate.
 */
function renderDonut(title, passed, total, tone) {
  const pct = safePercent(passed, total);
  const t = (typeof translations !== 'undefined' && translations[currentLang]) || { approved: 'aprovados' };
  const approvedLabel = t.approved || (currentLang === 'PT' ? 'aprovados' : 'approved');
  
  return `
    <div class="donut-wrap">
      <div class="donut" style="--pct:${pct}; --tone:${tone};">
        <span class="donut-value">${pct.toFixed(1)}%</span>
      </div>
      <div class="donut-label">${title}<br>${passed}/${total} ${approvedLabel}</div>
    </div>`;
}

/**
 * Renders a single coverage progress bar row.
 */
function renderCoverageBar(label, percent) {
  const pct = typeof percent === 'number' && !Number.isNaN(percent)
    ? Math.max(0, Math.min(100, percent))
    : 0;
  const display = typeof percent === 'number' && !Number.isNaN(percent)
    ? `${percent.toFixed(1)}%`
    : 'N/D';
  return `
    <div class="coverage-row">
      <div class="coverage-head">
        <span>${label}</span>
        <span>${display}</span>
      </div>
      <div class="coverage-track">
        <div class="coverage-fill" style="width:${pct}%"></div>
      </div>
    </div>`;
}

/**
 * Renders a horizontal stacked bar row for pass/fail/skip breakdown.
 */
function renderBarRow(label, passed, failed, skipped, total) {
  if (total <= 0) return '';
  const passW  = (passed  / total) * 100;
  const failW  = (failed  / total) * 100;
  const skipW  = (skipped / total) * 100;
  const t = (typeof translations !== 'undefined' && translations[currentLang]) || { totalLabel: 'Total' };
  const totalLabel = t.totalLabel || (currentLang === 'PT' ? 'Total' : 'Total');

  return `
    <div class="bar-row">
      <span>${label}: ${passed} ✅ / ${failed} ❌ / ${skipped} ⏭️ (${totalLabel}: ${total})</span>
      <div class="bar-track" role="img" aria-label="${label}">
        <div class="bar-pass" style="width:${passW}%"></div>
        <div class="bar-fail" style="width:${failW}%"></div>
        <div class="bar-skip" style="width:${skipW}%"></div>
      </div>
    </div>`;
}

/* ── Playwright iframe loader ────────────────────── */

function readPlaywrightCounterFromAnchors(doc, label) {
  const pattern = new RegExp(`^${label}\\s*(\\d+)$`, 'i');
  for (const a of doc.querySelectorAll('a')) {
    const text  = (a.textContent || '').replace(/\s+/g, ' ').trim();
    const match = text.match(pattern);
    if (match) return safeNumber(match[1]);
  }
  return null;
}

function parsePlaywrightSummaryFromDocument(doc) {
  const all     = readPlaywrightCounterFromAnchors(doc, 'All');
  const passed  = readPlaywrightCounterFromAnchors(doc, 'Passed');
  const failed  = readPlaywrightCounterFromAnchors(doc, 'Failed');
  const flaky   = readPlaywrightCounterFromAnchors(doc, 'Flaky');
  const skipped = readPlaywrightCounterFromAnchors(doc, 'Skipped');

  if ([all, passed, failed, skipped].every(v => typeof v === 'number')) {
    return { tests: all, passed, failures: failed, flaky: flaky ?? 0, skipped };
  }

  const text    = (doc.body?.innerText || doc.documentElement?.innerText || '').replace(/\s+/g, ' ');
  const allM    = text.match(/\bAll\s*(\d+)\b/i);
  const passedM = text.match(/\bPassed\s*(\d+)\b/i);
  const failedM = text.match(/\bFailed\s*(\d+)\b/i);
  const flakyM  = text.match(/\bFlaky\s*(\d+)\b/i);
  const skippedM= text.match(/\bSkipped\s*(\d+)\b/i);

  if (!allM || !passedM || !failedM || !skippedM) return null;
  return {
    tests:    safeNumber(allM[1]),
    passed:   safeNumber(passedM[1]),
    failures: safeNumber(failedM[1]),
    flaky:    flakyM ? safeNumber(flakyM[1]) : 0,
    skipped:  safeNumber(skippedM[1])
  };
}

function loadPlaywrightSummaryFromUrl(reportUrl) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'absolute', width: '1px', height: '1px',
      opacity: '0', pointerEvents: 'none', left: '-9999px'
    });
    iframe.src = reportUrl;
    let done = false, pollTimer = null, timeoutTimer = null;

    const finalize = (result, error) => {
      if (done) return;
      done = true;
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
      iframe.remove();
      error ? reject(error) : resolve(result);
    };

    iframe.addEventListener('load', () => {
      pollTimer = setInterval(() => {
        try {
          const doc = iframe.contentDocument;
          if (!doc) return;
          const p = parsePlaywrightSummaryFromDocument(doc);
          if (p && p.tests > 0) finalize(p);
        } catch { finalize(null, new Error('read error')); }
      }, 250);
    });

    iframe.addEventListener('error', () => finalize(null, new Error('load error')));
    timeoutTimer = setTimeout(() => finalize(null, new Error('timeout')), 12000);
    document.body.appendChild(iframe);
  });
}

async function enrichE2EFromPlaywrightReports(data) {
  const next = JSON.parse(JSON.stringify(data || {}));
  next.e2e = next.e2e || {};
  next.e2e.byProject = next.e2e.byProject || {};

  const updates = await Promise.all(
    Object.entries(PLAYWRIGHT_REPORT_SOURCES).map(async ([k, url]) => {
      try { return { k, s: await loadPlaywrightSummaryFromUrl(url) }; }
      catch { return null; }
    })
  );

  for (const item of updates) {
    if (!item) continue;
    const { k, s } = item;
    // Preserve flaky count separately so QA efficiency can use it
    next.e2e.byProject[k] = {
      tests:    safeNumber(s.tests),
      passed:   safeNumber(s.passed),
      failures: safeNumber(s.failures),
      flaky:    safeNumber(s.flaky),
      errors:   0,
      skipped:  safeNumber(s.skipped),
      status:   (safeNumber(s.failures) + safeNumber(s.flaky)) === 0 ? 'passed' : 'failed'
    };
  }

  const totals = Object.values(next.e2e.byProject).reduce(
    (a, c) => {
      a.tests    += safeNumber(c.tests);
      a.failures += safeNumber(c.failures) + safeNumber(c.flaky || 0);
      a.errors   += safeNumber(c.errors);
      a.skipped  += safeNumber(c.skipped);
      a.passed   += safeNumber(c.passed);
      return a;
    },
    { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 }
  );

  next.e2e.totals = {
    ...totals,
    status: totals.tests > 0
      ? (totals.failures === 0 && totals.errors === 0 ? 'passed' : 'failed')
      : 'unknown'
  };

  return next;
}

/**
 * Updates the summary total counters if they exist on the page.
 */
function updateSummaryTotals(grandPassed, grandFailed) {
    const elPassed = document.getElementById('totalPassed');
    const elFailed = document.getElementById('totalFailed');
    const fmt = v => (typeof v === 'number' && Number.isFinite(v)) ? v : 0;
    if (elPassed) elPassed.textContent = fmt(grandPassed);
    if (elFailed) elFailed.textContent = fmt(grandFailed);
}
