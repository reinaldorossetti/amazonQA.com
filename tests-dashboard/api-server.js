const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const generator = require('./generate-dashboard-metrics.js');

const PORT = process.env.DASHBOARD_API_PORT || 3030;
const REPORTS_DIR = path.join(__dirname, 'reports');
const ROOT = fs.existsSync(path.join(__dirname, '..', 'package.json'))
  ? path.join(__dirname, '..')
  : process.cwd();
const HISTORY_DIR = path.join(REPORTS_DIR, 'history');

function sendJSON(res, statusCode, obj) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

const { execSync } = require('child_process');

function getMetricsFromDB() {
  try {
    const dbPath = path.join(__dirname, 'db', 'dashboard.sqlite3');
    if (!fs.existsSync(dbPath)) return null;

    // Get latest execution
    const execJson = execSync(`sqlite3 "${dbPath}" "SELECT * FROM test_executions ORDER BY id DESC LIMIT 1;" --json`, { encoding: 'utf8' });
    const executions = JSON.parse(execJson);
    if (!executions || executions.length === 0) return null;

    const main = executions[0];
    
    // Get E2E results for this execution
    const e2eJson = execSync(`sqlite3 "${dbPath}" "SELECT * FROM e2e_results WHERE execution_id = ${main.id};" --json`, { encoding: 'utf8' });
    const e2eRows = JSON.parse(e2eJson);

    const byProject = {};
    if (Array.isArray(e2eRows)) {
      e2eRows.forEach(row => {
        byProject[row.project] = {
          tests: row.tests,
          passed: row.passed,
          failures: row.failures,
          errors: row.errors,
          skipped: row.skipped,
          flaky: row.flaky,
          status: (row.failures + row.errors + row.flaky) === 0 ? 'passed' : 'failed',
          sourceFile: row.source_file
        };
      });
    }

    // Reconstruct the JSON structure
    return {
      generatedAt: main.generated_at,
      source: main.source,
      unit: {
        web: {
          tests: main.unit_web_tests,
          failures: main.unit_web_failures,
          errors: main.unit_web_errors,
          skipped: main.unit_web_skipped,
          passed: main.unit_web_passed,
          coverage: {
            statements: { percent: main.unit_web_cov_statements },
            lines: { percent: main.unit_web_cov_lines },
            functions: { percent: main.unit_web_cov_functions },
            branches: { percent: main.unit_web_cov_branches }
          }
        },
        backend: {
          tests: main.unit_backend_tests,
          failures: main.unit_backend_failures,
          errors: main.unit_backend_errors,
          skipped: main.unit_backend_skipped,
          passed: main.unit_backend_passed
        },
        totals: {
          tests: main.unit_web_tests + main.unit_backend_tests,
          failures: main.unit_web_failures + main.unit_backend_failures,
          errors: main.unit_web_errors + main.unit_backend_errors,
          skipped: main.unit_web_skipped + main.unit_backend_skipped,
          passed: main.unit_web_passed + main.unit_backend_passed,
          status: (main.unit_web_failures + main.unit_web_errors + main.unit_backend_failures + main.unit_backend_errors) === 0 ? 'passed' : 'failed'
        }
      },
      e2e: {
        byProject: byProject,
        totals: {
          tests: main.e2e_totals_tests,
          failures: main.e2e_totals_failures,
          errors: main.e2e_totals_errors,
          skipped: main.e2e_totals_skipped,
          passed: main.e2e_totals_passed,
          status: (main.e2e_totals_failures + main.e2e_totals_errors) === 0 ? 'passed' : 'failed'
        }
      },
      qaEfficiency: main.qa_efficiency_json ? JSON.parse(main.qa_efficiency_json) : {},
      scan: main.metadata_json ? JSON.parse(main.metadata_json) : {}
    };
  } catch (err) {
    console.error('Error reading from SQLite:', err);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if ((req.method === 'POST' || req.method === 'GET') && parsed.pathname === '/api/generate-dashboard') {
    try {
      // Run the generator (synchronous file writes inside)
      await generator.run();

      // Try to read from DB first
      const dbMetrics = getMetricsFromDB();
      if (dbMetrics) {
        return sendJSON(res, 200, dbMetrics);
      }

      // Fallback to JSON files
      const dateStr = new Date().toISOString().slice(0, 10);
      const historyFile = path.join(HISTORY_DIR, `${dateStr}.json`);
      if (fs.existsSync(historyFile)) {
        const content = fs.readFileSync(historyFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(content);
      }

      const main = path.join(REPORTS_DIR, 'dashboard-metrics.json');
      if (fs.existsSync(main)) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(fs.readFileSync(main, 'utf8'));
      }

      return sendJSON(res, 500, { error: 'Metrics generation completed but no output file found.' });
    } catch (err) {
      return sendJSON(res, 500, { error: err && err.message ? err.message : String(err) });
    }
  }

  if (req.method === 'GET' && parsed.pathname === '/api/db-metrics') {
    const dbMetrics = getMetricsFromDB();
    if (dbMetrics) {
      return sendJSON(res, 200, dbMetrics);
    }
    return sendJSON(res, 404, { error: 'No database metrics found' });
  }

  if (req.method === 'GET' && parsed.pathname === '/api/health') {
    return sendJSON(res, 200, { ok: true });
  }

  return sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Dashboard API server listening on http://localhost:${PORT}`);
});

module.exports = server;
