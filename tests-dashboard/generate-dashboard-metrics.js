const fs = require('node:fs');
const path = require('node:path');

const REPORTS_DIR = __dirname;
const ROOT = fs.existsSync(path.join(__dirname, '..', 'package.json'))
  ? path.join(__dirname, '..')
  : process.cwd();
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

  // Find the metric block by its name
  const quietRegex = new RegExp(`<span\\s+class=["']quiet["']>${metricName}<\\/span>`, 'i');
  const quietMatch = html.match(quietRegex);
  if (!quietMatch) return { percent: null, covered: 0, total: 0 };

  const pos = quietMatch.index;
  // Look backwards for the strong tag (percentage) within 200 chars
  const prevChunk = html.substring(Math.max(0, pos - 200), pos);
  const strongMatch = [...prevChunk.matchAll(/<span\s+class=["']strong["']>([^<]+)<\/span>/gi)].pop();
  
  // Look forwards for the fraction tag within 200 chars
  const nextChunk = html.substring(pos, pos + 200);
  const fractionMatch = nextChunk.match(/<span\s+class=["']fraction["']>([^<]+)<\/span>/i);

  const percentRaw = strongMatch ? strongMatch[1].trim() : '';
  const fractionRaw = fractionMatch ? fractionMatch[1].trim() : '0/0';

  const [coveredRaw = '0', totalRaw = '0'] = fractionRaw.split('/');
  const covered = parseIntSafe(coveredRaw);
  const total = parseIntSafe(totalRaw);
  
  // Try to parse percent, fallback to calculated if needed
  let percent = null;
  if (/^\d+(\.\d+)?%$/.test(percentRaw)) {
    percent = Number.parseFloat(percentRaw);
  } else if (total > 0) {
    percent = Math.round((covered / total) * 1000) / 10;
  }

  return { percent, covered, total };
}

// --------------------------------------------------
// Robust discovery helpers for CI environments
// --------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', '.git', '.gradle', 'build', 'dist', 'out', 'target']);

function safeJoin() {
  return path.join.apply(null, arguments);
}

function tryStat(p) {
  try { return fs.statSync(p); } catch { return null; }
}

function recursiveFind(dir, testFn, maxDepth = 6, results = [], depth = 0) {
  if (!dir || depth > maxDepth) return results;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    try {
      const name = e.name;
      const full = path.join(dir, name);
      if (e.isFile()) {
        if (testFn(name, full)) results.push(full);
      } else if (e.isDirectory()) {
        if (SKIP_DIRS.has(name)) continue;
        recursiveFind(full, testFn, maxDepth, results, depth + 1);
      }
    } catch (err) { /* skip individual entries */ }
  }
  return results;
}

function findMostRecent(files) {
  if (!files || files.length === 0) return null;
  let best = null; let bestM = -1;
  for (const f of files) {
    const s = tryStat(f);
    if (!s) continue;
    const m = s.mtimeMs || 0;
    if (m > bestM) { bestM = m; best = f; }
  }
  return best;
}

function findJUnitAnywhere(rootDirs = [ROOT], preferWeb = false) {
  const nameRegex = /^junit(-report)?(\.xml)?$|^unit-report\.xml$|^junit-report\.xml$/i;
  const matches = [];
  for (const rd of rootDirs) {
    recursiveFind(rd, (name, full) => {
      if (nameRegex.test(name)) return true; return false;
    }, 5, matches, 0);
  }
  if (matches.length === 0) return null;
  // Prefer paths that include web/frontend/unit-tests-web when preferWeb
  if (preferWeb) {
    const pref = matches.find(p => /unit[-_]?tests[-_]?web|web[\/\\]/i.test(p));
    if (pref) return pref;
  }
  return findMostRecent(matches) || matches[0];
}

function findCoverageAnywhere(rootDirs = [ROOT]) {
  const matches = [];
  for (const rd of rootDirs) {
    recursiveFind(rd, (name, full) => {
      if (/index\.html$/i.test(name) && /coverage/i.test(full)) return true; return false;
    }, 6, matches, 0);
  }
  return findMostRecent(matches);
}

/**
 * Parse a Playwright report index.html and extract basic counters.
 * Returns null if no sensible counters are found.
 */
function parsePlaywrightSummaryFromHTML(html) {
  if (!html) return null;
  // Strip tags to plain text and normalize whitespace
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const allM = text.match(/\bAll\s*(\d+)\b/i);
  const passedM = text.match(/\bPassed\s*(\d+)\b/i);
  const failedM = text.match(/\bFailed\s*(\d+)\b/i);
  const flakyM = text.match(/\bFlaky\s*(\d+)\b/i);
  const skippedM = text.match(/\bSkipped\s*(\d+)\b/i);

  const all = allM ? parseIntSafe(allM[1]) : null;
  const passed = passedM ? parseIntSafe(passedM[1]) : null;
  const failures = failedM ? parseIntSafe(failedM[1]) : 0;
  const flaky = flakyM ? parseIntSafe(flakyM[1]) : 0;
  const skipped = skippedM ? parseIntSafe(skippedM[1]) : 0;

  let tests = all;
  if (tests === null) {
    // If 'All' not present, try to compute from other counters
    if (passed !== null) tests = passed + failures + skipped + flaky;
    else return null;
  }

  const status = tests > 0 && failures === 0 ? 'passed' : (tests > 0 ? 'failed' : 'unknown');

  return { tests, passed: passed ?? Math.max(0, tests - failures - skipped - flaky), failures, errors: 0, skipped, flaky, status };
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

function computeQAEfficiency(data) {
  const uw = data?.unit?.web ?? {};
  const ub = data?.unit?.backend ?? {};
  const e2eTotals = data?.e2e?.totals ?? {};
  
  const totalE2E = parseIntSafe(e2eTotals.tests) || Object.values(data?.e2e?.byProject || {}).reduce((s, p) => s + parseIntSafe(p.tests), 0);
  
  const uwF = parseIntSafe(uw.failures) + parseIntSafe(uw.errors);
  const ubF = parseIntSafe(ub.failures) + parseIntSafe(ub.errors);
  const e2eF = parseIntSafe(e2eTotals.failures) + parseIntSafe(e2eTotals.errors);
  const allFails = uwF + ubF + e2eF;

  const linesTotal = parseIntSafe(uw?.coverage?.lines?.total);
  const kloc = linesTotal > 0 ? Math.max(0.1, +(linesTotal / 1000).toFixed(1)) : 0;
  const bugs = allFails > 0 ? Math.max(1, Math.round(allFails / 10)) : 0;
  const defectValue = kloc > 0 ? +(bugs / kloc).toFixed(2) : 0;

  const flakyFromProjects = Object.values(data?.e2e?.byProject || {}).reduce((s, p) => s + parseIntSafe(p.flaky || 0), 0);
  const flakyTests = flakyFromProjects || 0;
  const flakinessValue = totalE2E > 0 ? +(flakyTests / totalE2E * 100) : 0;

  const manualPerTest = 0.137;
  const autoPerTest = 0.0068;
  const manualHours = +(totalE2E * manualPerTest).toFixed(1);
  const automationHours = +(totalE2E * autoPerTest).toFixed(1);
  const savedHours = +(manualHours - automationHours).toFixed(1);

  const escapedToProduction = 0;
  const detectedInQA = bugs;
  const leakageRate = bugs > 0 ? +(escapedToProduction / (escapedToProduction + bugs) * 100).toFixed(1) : 0;
  
  const automated = totalE2E;
  const manual = Math.round(totalE2E * 0.15);
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

function createMetrics() {
  let webUnitJunitPath = [
    path.join(REPORTS_DIR, 'unit-tests-web', 'junit.xml'), // Caminho prioritário
    path.join(REPORTS_DIR, 'unit-test-report-web', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests-web', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests', 'junit.xml'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  let backendUnitJunitPath = [
    path.join(REPORTS_DIR, 'unit-tests-backend', 'junit.xml'), // Caminho prioritário
    path.join(REPORTS_DIR, 'unit-test-report-backend', 'unit-report.xml'),
    path.join(REPORTS_DIR, 'unit-tests-backend', 'unit-report.xml'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  let webUnitCoveragePath = [
    path.join(REPORTS_DIR, 'unit-tests-web', 'coverage', 'index.html'),
    path.join(REPORTS_DIR, 'unit-tests-web', 'coverage', 'lcov-report', 'index.html'),
    path.join(REPORTS_DIR, 'unit-tests', 'coverage', 'index.html'),
    path.join(REPORTS_DIR, 'unit-test-report-web', 'coverage', 'index.html'),
  ].find((candidatePath) => fs.existsSync(candidatePath));

  if (webUnitCoveragePath) {
    console.log(`Found web coverage at: ${webUnitCoveragePath}`);
  } else {
    console.log('Web coverage report not found in standard locations.');
  }

  // If not found in REPORTS_DIR, try a wider repository scan (useful in CI)
  const scanRoots = [REPORTS_DIR, ROOT, process.env.GITHUB_WORKSPACE || ROOT].filter(Boolean);
  if (!webUnitJunitPath) {
    const found = findJUnitAnywhere(scanRoots, true);
    if (found) {
      console.log(`Discovered web JUnit at: ${path.relative(ROOT, found)}`);
      webUnitJunitPath = found;
    }
  }
  if (!backendUnitJunitPath) {
    // prefer backend-like paths
    const found = findJUnitAnywhere(scanRoots, false);
    if (found && /backend|server|api|service/i.test(found)) {
      console.log(`Discovered backend JUnit at: ${path.relative(ROOT, found)}`);
      backendUnitJunitPath = found;
    } else {
      // try to find any junit that looks like backend
      const candidates = [];
      recursiveFind(rd, (name, full) => /junit.*\.xml$/i.test(name) && /backend|service|api/i.test(full), 5, candidates);
      const pick = findMostRecent(candidates);
      if (pick) { backendUnitJunitPath = pick; console.log(`Discovered backend JUnit (fallback) at: ${path.relative(ROOT, pick)}`); }
    }
  }
  if (!webUnitCoveragePath) {
    const cov = findCoverageAnywhere(scanRoots);
    if (cov) { webUnitCoveragePath = cov; console.log(`Discovered coverage HTML at: ${path.relative(ROOT, cov)}`); }
  }

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

  // Discover Playwright reports (index.html under playwright-report-* dirs)
  try {
    const scanRoots = [REPORTS_DIR, ROOT, process.env.GITHUB_WORKSPACE || ROOT].filter(Boolean);
    const pwIndexFiles = [];
    for (const rd of scanRoots) {
      recursiveFind(rd, (name, full) => {
        return name.toLowerCase() === 'index.html' && /playwright-report[-_]/i.test(full);
      }, 6, pwIndexFiles, 0);
    }

    // Deduplicate
    const uniq = Array.from(new Set(pwIndexFiles));
    for (const f of uniq) {
      try {
        const dirName = path.basename(path.dirname(f));
        const key = dirName.replace(/^playwright-report[-_]/i, '').toLowerCase();
        const html = safeRead(f);
        const stats = parsePlaywrightSummaryFromHTML(html);
        if (!stats) continue;
        const rel = path.relative(ROOT, f).replace(/\\/g, '/');
        if (e2eByProject[key]) {
          // merge counts
          const ex = e2eByProject[key];
          e2eByProject[key] = {
            tests: (ex.tests || 0) + (stats.tests || 0),
            failures: (ex.failures || 0) + (stats.failures || 0),
            errors: (ex.errors || 0) + (stats.errors || 0),
            skipped: (ex.skipped || 0) + (stats.skipped || 0),
            passed: (ex.passed || 0) + (stats.passed || 0),
            status: ((ex.tests || 0) + (stats.tests || 0)) > 0 && ((ex.failures || 0) + (stats.failures || 0) + (ex.errors || 0) + (stats.errors || 0)) === 0 ? 'passed' : 'failed',
            sourceFile: ex.sourceFile ? `${ex.sourceFile};${rel}` : rel,
          };
        } else {
          e2eByProject[key] = { ...stats, sourceFile: rel };
        }
        console.log(`Discovered Playwright report for '${key}': ${rel}`);
      } catch (err) { /* ignore individual parse errors */ }
    }
  } catch (err) { /* ignore */ }

  // Ensure known Playwright projects appear in the JSON even if no report was found
  try {
    const PW_KEYS = ['frontend-chromium', 'frontend-edge', 'api'];
    for (const k of PW_KEYS) {
      if (!e2eByProject[k]) {
        e2eByProject[k] = { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0, status: 'unknown', sourceFile: null };
      }
    }
  } catch (err) { /* ignore */ }

  const e2eList = Object.values(e2eByProject);
  const e2eTotals = e2eList.reduce(
    (acc, current) => {
      acc.tests += current.tests || 0;
      acc.failures += current.failures || 0;
      acc.errors += current.errors || 0;
      acc.skipped += current.skipped || 0;
      acc.passed += current.passed || 0;
      return acc;
    },
    { tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 },
  );

  // Build scan metadata for debugging/CI visibility
  const scanInfo = {
    webUnitJunitPath: webUnitJunitPath ? path.relative(ROOT, webUnitJunitPath).replace(/\\/g, '/') : null,
    backendUnitJunitPath: backendUnitJunitPath ? path.relative(ROOT, backendUnitJunitPath).replace(/\\/g, '/') : null,
    webUnitCoveragePath: webUnitCoveragePath ? path.relative(ROOT, webUnitCoveragePath).replace(/\\/g, '/') : null,
    playwrightIndexFiles: (typeof uniq !== 'undefined' ? uniq.map(f => path.relative(ROOT, f).replace(/\\/g, '/')) : []),
    e2eDirs: (() => {
      try {
        return fs.existsSync(path.join(REPORTS_DIR, 'e2e-junit'))
          ? fs.readdirSync(path.join(REPORTS_DIR)).filter(e => fs.statSync(path.join(REPORTS_DIR, e)).isDirectory() && e.startsWith('e2e-junit-'))
          : [];
      } catch { return []; }
    })(),
    scanRoots
  };

  const result = {
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
    scan: scanInfo
  };
  
  result.qaEfficiency = computeQAEfficiency(result);
  
  return result;
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
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const fullId = `${dateStr}-${hour}h${min}m`;
  
  const HISTORY_DIR = path.join(REPORTS_DIR, 'history');
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const historyFile = path.join(HISTORY_DIR, `${fullId}.json`);
  fs.writeFileSync(historyFile, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(`Wrote history snapshot: ${path.relative(ROOT, historyFile)}`);

  // Write a latest-scan.json with the discovery details (useful for CI debugging)
  try {
    const latestScanPath = path.join(HISTORY_DIR, 'latest-scan.json');
    const scanObj = {
      generatedAt: metrics.generatedAt || new Date().toISOString(),
      writtenAt: new Date().toISOString(),
      scan: metrics.scan || null
    };
    fs.writeFileSync(latestScanPath, `${JSON.stringify(scanObj, null, 2)}\n`, 'utf8');
    console.log(`Wrote latest scan info: ${path.relative(ROOT, latestScanPath)}`);
  } catch (e) { /* non-fatal */ }

  // Maintain a dates.json with the most recent 7 dates available
  // Collect date files from HISTORY_DIR, plus any snapshots that may exist in
  // unit-tests-web, unit-tests-backend and e2e-junit-* folders so the UI can
  // present a complete list even if some snapshots live outside history/.
  const datePattern = /^(\d{4}-\d{2}-\d{2})(-\d{2}h\d{2}m)?\.json$/;
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
  const recentDates = dates.slice(0, 7);
  fs.writeFileSync(path.join(HISTORY_DIR, 'dates.json'), `${JSON.stringify(recentDates, null, 2)}\n`, 'utf8');
  console.log(`Updated history dates: ${recentDates.join(', ')}`);

  // If there is an embedded fallback JSON in dashboard-metrics-data.js, try to
  // extract its generatedAt and include as a candidate date (useful for demo data).
  try {
    // Try new path (assets/data/) first, then old root path for backwards-compat
    const fallbackPath = [
      path.join(REPORTS_DIR, 'assets', 'data', 'dashboard-metrics-data.js'),
      path.join(REPORTS_DIR, 'dashboard-metrics-data.js')
    ].find(p => fs.existsSync(p));
    if (fallbackPath) {
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
              const updated = Array.from(dateSet).sort((a, b) => b.localeCompare(a)).slice(0, 7);
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
        const out = path.join(targetDir, `${fullId}.json`);
        fs.writeFileSync(out, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
        // trim older snapshots in this directory (keep last 5)
        const candidates = fs.readdirSync(targetDir).filter(f => datePattern.test(f)).sort((a,b) => b.localeCompare(a));
        const toRemove = candidates.slice(5);
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
        const out = path.join(adir, `${fullId}.json`);
        fs.writeFileSync(out, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
        const candidates = fs.readdirSync(adir).filter(f => datePattern.test(f)).sort((a,b) => b.localeCompare(a));
        const toRemove = candidates.slice(5);
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

if (require.main === module) {
  run();
}

module.exports = { createMetrics, run };
