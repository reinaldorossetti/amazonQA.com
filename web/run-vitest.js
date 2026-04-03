#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Rodando 120 testes frontend...\n');

const result = spawnSync('npx', ['vitest', 'run', '--reporter=default'], {
  cwd: 'd:\\github-projects\\tester.com',
  stdio: 'pipe',
  encoding: 'utf-8',
  shell: true,
});

const output = result.stdout + '\n' + result.stderr;

console.log(output);

fs.writeFileSync('d:\\github-projects\\tester.com\\test-results-final.txt', output);

console.log('\n✅ Resultados salvos em: test-results-final.txt');

process.exit(result.status);
