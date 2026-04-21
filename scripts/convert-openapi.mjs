import fs from 'fs';
import { parse } from 'yaml';

const inPath = './docs/swagger/openapi.yaml';
const outPath = './docs/swagger/openapi.json';

try {
  const raw = fs.readFileSync(inPath, 'utf8');
  const doc = parse(raw);
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);
} catch (err) {
  console.error('Conversion failed:', err);
  process.exit(1);
}
