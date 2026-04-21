const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'tests-dashboard');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'dashboard-metrics.json');

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parseIntSafe(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTagWithAttrs(xml, tagName) {
  return xml.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'))?.[0] ?? null;
}

function getAttrValue(tag, attrName) {
  return tag?.match(new RegExp(`${attrName}="(\\d+)"`, 'i'))?.[1] ?? null;
}

function parseJUnit(xml) {
  if (!xml) {
    return {
      tests: 0,
      failures: 0,
      errors: 0,
      skipped: 0,
      passed: 0,
      status: 'unknown',
    };
  }

  const suitesTag = getTagWithAttrs(xml, 'testsuites');
  const suiteTag = getTagWithAttrs(xml, 'testsuite');
  const targetTag = suitesTag ?? suiteTag;

  const tests = parseIntSafe(getAttrValue(targetTag, 'tests'));
  const failures = parseIntSafe(getAttrValue(targetTag, 'failures'));
  const errors = parseIntSafe(getAttrValue(targetTag, 'errors'));
  const skipped = parseIntSafe(getAttrValue(targetTag, 'skipped'));
  const passed = Math.max(tests - failures - errors - skipped, 0);

  let status = 'unknown';
  if (tests > 0) {
    status = failures === 0 && errors === 0 ? 'passed' : 'failed';
  }

  return { tests, failures, errors, skipped, passed, status };
}

function parseCoverageMetric(html, metricName) {
  if (!html) {
    return { percent: null, covered: 0, total: 0 };
  }

  const metricRegex = new RegExp(
    `<span\\s+class=["']strong["']>([^<]+)<\\/span>\\s*<span\\s+class=["']quiet["']>${metricName}<\\/span>\\s*<span\\s+class=["']fraction["']>([^<]+)<\\/span>`,
    'i',
  );
  const match = html.match(metricRegex);

  if (!match) {
    return { percent: null, covered: 0, total: 0 };
  }

  const percentRaw = match[1].trim();
  const [coveredRaw = '0', totalRaw = '0'] = match[2].trim().split('/');
  const covered = parseIntSafe(coveredRaw);
  const total = parseIntSafe(totalRaw);
  const percent = /^\d+(\.\d+)?%$/.test(percentRaw) ? Number.parseFloat(percentRaw) : null;

  return { percent, covered, total };
}

function readE2EJunitStats() {
  const statsByProject = {};

  // Collect candidate directories from two possible layouts:
  // 1. Old layout:  tests-report/e2e-junit/e2e-junit-api/
  // 2. New layout:  tests-report/e2e-junit-api/  (flat, from download-artifact)
  const candidateDirs = [];

  // Old nested layout
  const nestedRoot = path.join(REPORTS_DIR, 'e2e-junit');
  if (fs.existsSync(nestedRoot)) {
    const nested = fs.readdirSync(nestedRoot, { withFileTypes: true }).filter((e) => e.isDirectory());
    for (const entry of nested) {
      candidateDirs.push({ dir: path.join(nestedRoot, entry.name), name: entry.name });
    }
  }

  // New flat layout: scan REPORTS_DIR for directories matching e2e-junit-*
  if (fs.existsSync(REPORTS_DIR)) {
    const flat = fs.readdirSync(REPORTS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('e2e-junit-'));
    for (const entry of flat) {
      candidateDirs.push({ dir: path.join(REPORTS_DIR, entry.name), name: entry.name });
    }
  }

  for (const { dir: artifactDir, name } of candidateDirs) {
    const projectName = name.replace(/^e2e-junit-/, '');
    if (statsByProject[projectName]) continue; // avoid duplicates, first wins

    const candidates = [
      path.join(artifactDir, 'junit-report.xml'),
      path.join(artifactDir, 'web', 'junit-report.xml'),
    ];

    const junitPath = candidates.find((p) => fs.existsSync(p));
    const xml = junitPath ? safeRead(junitPath) : null;
    statsByProject[projectName] = {
      ...parseJUnit(xml),
      sourceFile: junitPath ? path.relative(ROOT, junitPath).replace(/\\/g, '/') : null,
    };
  }

  return statsByProject;
}

function createMetrics() {
  const webUnitJunitPath = [
    path.join(REPORTS_DIR, 'unit-tests-web', 'junit.xml'), // Caminho prioritário
    path.join(REPORTS_DIR, 'unit-test-report-web', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests-web', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests', 'junit.xml'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  const backendUnitJunitPath = [
    path.join(REPORTS_DIR, 'unit-tests-backend', 'junit.xml'), // Caminho prioritário
    path.join(REPORTS_DIR, 'unit-test-report-backend', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests-backend', 'unit-report.xml'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  const webUnitCoveragePath = [
    path.join(REPORTS_DIR, 'unit-tests-web', 'coverage', 'index.html'),
    path.join(REPORTS_DIR, 'unit-tests', 'coverage', 'index.html'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  const webUnitJunit = parseJUnit(webUnitJunitPath ? safeRead(webUnitJunitPath) : null);
  const backendUnitJunit = parseJUnit(backendUnitJunitPath ? safeRead(backendUnitJunitPath) : null);
  const coverageHtml = webUnitCoveragePath ? safeRead(webUnitCoveragePath) : null;

  const coverage = {
    statements: parseCoverageMetric(coverageHtml, 'Statements'),
    branches: parseCoverageMetric(coverageHtml, 'Branches'),
    functions: parseCoverageMetric(coverageHtml, 'Functions'),
    lines: parseCoverageMetric(coverageHtml, 'Lines'),
  };

  const e2eByProject = readE2EJunitStats();
  const e2eList = Object.values(e2eByProject);
  const e2eTotals = e2eList.reduce(
    (acc, current) => {
      acc.tests += current.tests;
      acc.failures += current.failures;
      acc.errors += current.errors;
      acc.skipped += current.skipped;
      acc.passed += current.passed;
      return acc;
    },
    { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 },
  );

  return {
    generatedAt: new Date().toISOString(),
    source: 'github-actions-artifacts',
    unit: {
      web: {
        ...webUnitJunit,
        sourceFile: webUnitJunitPath
          ? path.relative(ROOT, webUnitJunitPath).replace(/\\/g, '/')
          : null,
        coverage,
        coverageSourceFile: webUnitCoveragePath
          ? path.relative(ROOT, webUnitCoveragePath).replace(/\\/g, '/')
          : null,
      },
      backend: {
        ...backendUnitJunit,
        sourceFile: backendUnitJunitPath
          ? path.relative(ROOT, backendUnitJunitPath).replace(/\\/g, '/')
          : null,
      },
      totals: {
        tests: webUnitJunit.tests + backendUnitJunit.tests,
        failures: webUnitJunit.failures + backendUnitJunit.failures,
        errors: webUnitJunit.errors + backendUnitJunit.errors,
        skipped: webUnitJunit.skipped + backendUnitJunit.skipped,
        passed: webUnitJunit.passed + backendUnitJunit.passed,
        status:
          webUnitJunit.tests + backendUnitJunit.tests > 0
            ? webUnitJunit.failures + backendUnitJunit.failures + webUnitJunit.errors + backendUnitJunit.errors === 0
              ? 'passed'
              : 'failed'
            : 'unknown',
      },
    },
    e2e: {
      byProject: e2eByProject,
      totals: {
        ...e2eTotals,
        status: e2eTotals.tests > 0 && e2eTotals.failures === 0 && e2eTotals.errors === 0 ? 'passed' : 'failed',
      },
    },
  };
}

function run() {
  if (!fs.existsSync(REPORTS_DIR)) {
    console.error(`Directory not found: ${REPORTS_DIR}`);
    process.exit(1);
  }

  const metrics = createMetrics();
  // Write main dashboard file
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(`Dashboard metrics generated at ${path.relative(ROOT, OUTPUT_FILE)}`);

  // Also persist per-date snapshots so the UI can show a filter by execution date.
  // We'll write a history file with the full metrics and also copies inside
  // unit-tests-web and unit-tests-backend (if present), plus any e2e artifact dirs.
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const HISTORY_DIR = path.join(REPORTS_DIR, 'history');
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const historyFile = path.join(HISTORY_DIR, `${dateStr}.json`);
  fs.writeFileSync(historyFile, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(`Wrote history snapshot: ${path.relative(ROOT, historyFile)}`);

  // Maintain a dates.json with the most recent 3 dates available
  // Collect date files from HISTORY_DIR, plus any snapshots that may exist in
  // unit-tests-web, unit-tests-backend and e2e-junit-* folders so the UI can
  // present a complete list even if some snapshots live outside history/.
  const datePattern = /^\d{4}-\d{2}-\d{2}\.json$/;
  const dateSet = new Set();

  // from history dir
  try {
    const files = fs.readdirSync(HISTORY_DIR).filter(f => datePattern.test(f));
    for (const f of files) dateSet.add(f.replace(/\.json$/, ''));
  } catch (e) { /* ignore */ }

  // from unit-test folders
  const extraDirs = [path.join(REPORTS_DIR, 'unit-tests-web'), path.join(REPORTS_DIR, 'unit-tests-backend')];
  for (const d of extraDirs) {
    try {
      if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
        const fsFiles = fs.readdirSync(d).filter(f => datePattern.test(f));
        for (const f of fsFiles) dateSet.add(f.replace(/\.json$/, ''));
      }
    } catch (e) { /* ignore */ }
  }

  // from e2e dirs
  try {
    const e2eDirs = fs.readdirSync(REPORTS_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith('e2e-junit-'))
      .map(d => path.join(REPORTS_DIR, d.name));
    for (const ed of e2eDirs) {
      try {
        const edFiles = fs.readdirSync(ed).filter(f => datePattern.test(f));
        for (const f of edFiles) dateSet.add(f.replace(/\.json$/, ''));
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }

  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  const recentDates = dates.slice(0, 3);
  fs.writeFileSync(path.join(HISTORY_DIR, 'dates.json'), `${JSON.stringify(recentDates, null, 2)}\n`, 'utf8');
  console.log(`Updated history dates: ${recentDates.join(', ')}`);

  // If there is an embedded fallback JSON in dashboard-metrics-data.js, try to
  // extract its generatedAt and include as a candidate date (useful for demo data).
  try {
    const fallbackPath = path.join(REPORTS_DIR, 'dashboard-metrics-data.js');
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf8');
      // Try to extract a JS-assigned object: window.DASHBOARD_METRICS_FALLBACK = { ... };
      const m = content.match(/window\.DASHBOARD_METRICS_FALLBACK\s*=\s*({[\s\S]*?})\s*;/);
      if (m) {
        try {
          const obj = JSON.parse(m[1]);
          const gen = obj && obj.generatedAt ? String(obj.generatedAt).slice(0,10) : null;
          if (gen) {
            const outPath = path.join(HISTORY_DIR, `${gen}.json`);
            if (!fs.existsSync(outPath)) {
              fs.writeFileSync(outPath, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
              console.log(`Wrote fallback snapshot: ${path.relative(ROOT, outPath)}`);
            }
            if (!dateSet.has(gen)) {
              dateSet.add(gen);
              const updated = Array.from(dateSet).sort((a, b) => b.localeCompare(a)).slice(0, 3);
              fs.writeFileSync(path.join(HISTORY_DIR, 'dates.json'), `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
              console.log(`Included fallback generatedAt date: ${gen}`);
            }
          }
        } catch (err) {
          // ignore parse errors
        }
      }
    }
  } catch (e) { /* ignore */ }

  // Write copies into unit-tests-web and unit-tests-backend folders (so older systems can pick by path)
  const copyTargets = [path.join(REPORTS_DIR, 'unit-tests-web'), path.join(REPORTS_DIR, 'unit-tests-backend')];
  for (const targetDir of copyTargets) {
    try {
      if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) {
        const out = path.join(targetDir, `${dateStr}.json`);
        fs.writeFileSync(out, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
        // trim older snapshots in this directory (keep last 3)
        const candidates = fs.readdirSync(targetDir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort((a,b) => b.localeCompare(a));
        const toRemove = candidates.slice(3);
        for (const r of toRemove) fs.unlinkSync(path.join(targetDir, r));
      }
    } catch (e) {
      console.warn(`Failed to write copy into ${targetDir}:`, e && e.message);
    }
  }

  // Also write copies into any e2e-junit-* directories found at REPORTS_DIR
  try {
    const e2eDirs = fs.readdirSync(REPORTS_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith('e2e-junit-'))
      .map(d => path.join(REPORTS_DIR, d.name));
    for (const adir of e2eDirs) {
      try {
        const out = path.join(adir, `${dateStr}.json`);
        fs.writeFileSync(out, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
        const candidates = fs.readdirSync(adir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort((a,b) => b.localeCompare(a));
        const toRemove = candidates.slice(3);
        for (const r of toRemove) fs.unlinkSync(path.join(adir, r));
      } catch (e) { /* non-fatal */ }
    }
  } catch (e) { /* ignore */ }

  // Ensure history directory also contains any snapshots that may exist in the
  // unit / e2e folders (copy them into history if they are missing).
  try {
    const extraDirs = [path.join(REPORTS_DIR, 'unit-tests-web'), path.join(REPORTS_DIR, 'unit-tests-backend')];
    const e2eDirs = fs.readdirSync(REPORTS_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith('e2e-junit-'))
      .map(d => path.join(REPORTS_DIR, d.name));

    for (const d of extraDirs.concat(e2eDirs)) {
      try {
        if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) continue;
        const found = fs.readdirSync(d).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
        for (const f of found) {
          const src = path.join(d, f);
          const dst = path.join(HISTORY_DIR, f);
          if (!fs.existsSync(dst)) {
            try { fs.copyFileSync(src, dst); console.log(`Copied ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dst)}`); }
            catch (e) { /* ignore copy errors */ }
          }
        }
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
}

run();
