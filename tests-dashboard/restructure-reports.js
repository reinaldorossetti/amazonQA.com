const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const REPORTS = path.join(ROOT, 'reports');
const DB = path.join(ROOT, 'db');

function ensure(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensure(REPORTS);
ensure(DB);

const moveIfExists = (src, dest) => {
  if (!fs.existsSync(src)) return false;
  const destDir = path.dirname(dest);
  ensure(destDir);
  try {
    fs.renameSync(src, dest);
    console.log(`Moved: ${src} -> ${dest}`);
    return true;
  } catch (err) {
    console.error(`Failed to move ${src} -> ${dest}:`, err.message);
    return false;
  }
};

// Move top-level expected report files
const topFiles = ['dashboard-metrics.json', 'dashboard.sqlite3', 'latest-scan.json', 'dates.json', 'qa-efficiency-metrics.json', 'dashboard-metrics-data.js'];
for (const f of topFiles) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    if (f.endsWith('.sqlite3')) {
      moveIfExists(src, path.join(DB, f));
    } else {
      moveIfExists(src, path.join(REPORTS, f));
    }
  }
}

// Move history directory
if (fs.existsSync(path.join(ROOT, 'history'))) {
  moveIfExists(path.join(ROOT, 'history'), path.join(REPORTS, 'history'));
}

// Move typical report directories
const patterns = ['unit-tests-web', 'unit-tests-backend', 'e2e-junit-', 'playwright-report-'];
for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  try {
    const name = entry.name;
    if (entry.isDirectory()) {
      for (const p of patterns) {
        if (p.endsWith('-') ? name.startsWith(p) : name === p) {
          moveIfExists(path.join(ROOT, name), path.join(REPORTS, name));
          break;
        }
      }
    }
  } catch (err) { /* ignore */ }
}

console.log('Restructure complete.');
