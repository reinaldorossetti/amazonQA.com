const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'db', 'dashboard.sqlite3');

function migrate() {
  // ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);

  // main execution table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT UNIQUE,
      generated_at TEXT,
      source TEXT,
      total_tests INTEGER DEFAULT 0,
      total_failures INTEGER DEFAULT 0,
      total_errors INTEGER DEFAULT 0,
      total_skipped INTEGER DEFAULT 0,
      total_passed INTEGER DEFAULT 0,

      unit_web_tests INTEGER DEFAULT 0,
      unit_web_failures INTEGER DEFAULT 0,
      unit_web_errors INTEGER DEFAULT 0,
      unit_web_skipped INTEGER DEFAULT 0,
      unit_web_passed INTEGER DEFAULT 0,
      unit_web_cov_statements REAL,
      unit_web_cov_lines REAL,
      unit_web_cov_functions REAL,
      unit_web_cov_branches REAL,

      unit_backend_tests INTEGER DEFAULT 0,
      unit_backend_failures INTEGER DEFAULT 0,
      unit_backend_errors INTEGER DEFAULT 0,
      unit_backend_skipped INTEGER DEFAULT 0,
      unit_backend_passed INTEGER DEFAULT 0,

      e2e_totals_tests INTEGER DEFAULT 0,
      e2e_totals_failures INTEGER DEFAULT 0,
      e2e_totals_errors INTEGER DEFAULT 0,
      e2e_totals_skipped INTEGER DEFAULT 0,
      e2e_totals_passed INTEGER DEFAULT 0,

      qa_efficiency_json TEXT,
      metadata_json TEXT
    );
  `);

  // per-project E2E results
  db.exec(`
    CREATE TABLE IF NOT EXISTS e2e_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id INTEGER,
      project TEXT,
      tests INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 0,
      failures INTEGER DEFAULT 0,
      errors INTEGER DEFAULT 0,
      skipped INTEGER DEFAULT 0,
      flaky INTEGER DEFAULT 0,
      source_file TEXT,
      FOREIGN KEY (execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
    );
  `);

  db.close();
  console.log(`SQLite DB migrated: ${DB_PATH}`);
}

if (require.main === module) migrate();

module.exports = { migrate, DB_PATH };
