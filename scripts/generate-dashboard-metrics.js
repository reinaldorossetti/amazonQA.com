const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'tests-report');
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
    `<span class="strong">([^<]+)</span>\\s*<span class="quiet">${metricName}</span>\\s*<span class='fraction'>([^<]+)</span>`,
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
  const e2eRoot = path.join(REPORTS_DIR, 'e2e-junit');
  if (!fs.existsSync(e2eRoot)) {
    return {};
  }

  const statsByProject = {};
  const artifactDirs = fs.readdirSync(e2eRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const dirEntry of artifactDirs) {
    const artifactDir = path.join(e2eRoot, dirEntry.name);
    const projectName = dirEntry.name.replace(/^e2e-junit-/, '');

    const candidates = [
      path.join(artifactDir, 'junit-report.xml'),
      path.join(artifactDir, 'web', 'junit-report.xml'),
    ];

    const junitPath = candidates.find((candidatePath) => fs.existsSync(candidatePath));
    const xml = junitPath ? safeRead(junitPath) : null;
    statsByProject[projectName] = {
      ...parseJUnit(xml),
      sourceFile: junitPath ? path.relative(ROOT, junitPath).replace(/\\/g, '/') : null,
    };
  }

  return statsByProject;
}

function createMetrics() {
  const unitJunitPath = path.join(REPORTS_DIR, 'unit-tests', 'junit.xml');
  const unitCoveragePath = path.join(REPORTS_DIR, 'unit-tests', 'coverage', 'index.html');

  const unitJunit = parseJUnit(safeRead(unitJunitPath));
  const coverageHtml = safeRead(unitCoveragePath);

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
      ...unitJunit,
      sourceFile: fs.existsSync(unitJunitPath)
        ? path.relative(ROOT, unitJunitPath).replace(/\\/g, '/')
        : null,
      coverage,
      coverageSourceFile: fs.existsSync(unitCoveragePath)
        ? path.relative(ROOT, unitCoveragePath).replace(/\\/g, '/')
        : null,
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
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(`Dashboard metrics generated at ${path.relative(ROOT, OUTPUT_FILE)}`);
}

run();
