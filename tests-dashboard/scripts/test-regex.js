const fs = require('fs');
const path = 'tests-dashboard/dashboard-metrics-data.js';
const content = fs.readFileSync(path, 'utf8');
const re = /"generatedAt"\s*:\s*"([0-9T:\-\.]+)Z?"/;
console.log('length', content.length);
const m = content.match(re);
console.log('match', m ? m[1] : null);
