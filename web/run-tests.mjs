#!/usr/bin/env node

import { execSync } from 'child_process';

try {
  console.log('🧪 Executando 120 testes frontend...\n');
  const result = execSync('npm run test', {
    cwd: 'd:\\github-projects\\tester.com',
    encoding: 'utf-8',
    stdio: 'inherit',
  });
  console.log(result);
} catch (error) {
  console.error('❌ Erro ao rodar testes:');
  console.error(error.message);
  process.exit(1);
}
