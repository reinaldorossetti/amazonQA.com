const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const generator = require('./generate-dashboard-metrics.js');

const PORT = process.env.DASHBOARD_API_PORT || 3030;
const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'tests-dashboard');
const HISTORY_DIR = path.join(REPORTS_DIR, 'history');

function sendJSON(res, statusCode, obj) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
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

  if (req.method === 'GET' && parsed.pathname === '/api/health') {
    return sendJSON(res, 200, { ok: true });
  }

  return sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Dashboard API server listening on http://localhost:${PORT}`);
});

module.exports = server;
