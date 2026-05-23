const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const HISTORY_DIR = path.join(ROOT, 'tests-dashboard', 'reports', 'history');

function safeReadJSON(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch(e) { return null; }
}

const datesPath = path.join(HISTORY_DIR, 'dates.json');
if (!fs.existsSync(datesPath)) {
  console.error('dates.json not found, run generate-dashboard-metrics.js first');
  process.exit(2);
}

const dates = safeReadJSON(datesPath) || [];
if (!Array.isArray(dates) || dates.length === 0) {
  console.error('No dates found in dates.json');
  process.exit(2);
}

let allOk = true;
for (const d of dates) {
  const p = path.join(HISTORY_DIR, `${d}.json`);
  const obj = safeReadJSON(p);
  if (!obj) {
    console.warn(`${d}: snapshot missing or invalid JSON`);
    allOk = false; continue;
  }

  const issues = [];
  if (!obj.generatedAt) issues.push('generatedAt missing');
  if (!obj.unit) issues.push('unit missing');
  if (!obj.unit || !obj.unit.web || typeof obj.unit.web.tests !== 'number') issues.push('unit.web.tests missing or not a number');
  if (!obj.unit || !obj.unit.backend || typeof obj.unit.backend.tests !== 'number') issues.push('unit.backend.tests missing or not a number');
  if (!obj.e2e || !obj.e2e.totals || typeof obj.e2e.totals.tests !== 'number') issues.push('e2e.totals.tests missing or not a number');

  if (issues.length) {
    console.warn(`${d}: validation issues →`, issues.join('; '));
    allOk = false;
  } else {
    console.log(`${d}: OK — tests web=${obj.unit.web.tests}, backend=${obj.unit.backend.tests}, e2e=${obj.e2e.totals.tests}`);
  }
}

process.exit(allOk ? 0 : 1);
