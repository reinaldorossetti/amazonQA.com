#!/usr/bin/env node

/**
 * Script para gerar relatório HTML customizado com screenshots de falhas
 * Uso: node generate-failure-report.js
 */

const fs = require('fs');
const path = require('path');

const reportDir = 'playwright-report';
const screenshotsDir = fs.existsSync(path.join('web', 'e2e', 'screenshots'))
  ? path.join('web', 'e2e', 'screenshots')
  : path.join('e2e', 'screenshots');
let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Falhas - Playwright Tests</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      padding: 30px;
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .timestamp {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: #f5f5f5;
      border-left: 4px solid #667eea;
      padding: 15px;
      border-radius: 4px;
    }

    .summary-card.failed {
      border-left-color: #e74c3c;
    }

    .summary-card.passed {
      border-left-color: #27ae60;
    }

    .summary-card h3 {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .summary-card .number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .failures {
      margin-top: 30px;
    }

    .failure-item {
      background: #fff5f5;
      border: 1px solid #ffd6d6;
      border-radius: 4px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .failure-header {
      background: #e74c3c;
      color: white;
      padding: 15px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }

    .failure-header:hover {
      background: #c0392b;
    }

    .failure-header .title {
      font-weight: 600;
    }

    .failure-header .toggle {
      font-size: 20px;
    }

    .failure-content {
      display: none;
      padding: 20px;
    }

    .failure-content.active {
      display: block;
    }

    .screenshot-container {
      margin-top: 15px;
      padding: 15px;
      background: white;
      border-radius: 4px;
    }

    .screenshot-container h4 {
      color: #333;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .screenshot-container img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f9f9f9;
    }

    .html-viewer {
      margin-top: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .html-viewer button {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .html-viewer button:hover {
      background: #5568d3;
    }

    .html-iframe {
      display: none;
      margin-top: 10px;
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .html-iframe.active {
      display: block;
    }

    .no-failures {
      text-align: center;
      padding: 40px 20px;
      color: #27ae60;
    }

    .no-failures svg {
      width: 64px;
      height: 64px;
      margin-bottom: 15px;
    }

    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Relatório de Testes - Playwright</h1>
    <p class="timestamp">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>

    <div class="summary">
      <div class="summary-card failed">
        <h3>Testes Falhados</h3>
        <div class="number" id="failed-count">0</div>
      </div>
      <div class="summary-card passed">
        <h3>Testes Passados</h3>
        <div class="number" id="passed-count">0</div>
      </div>
      <div class="summary-card">
        <h3>Taxa de Sucesso</h3>
        <div class="number" id="success-rate">0%</div>
      </div>
    </div>

    <div class="failures" id="failures-container">
      <h2 style="color: #333; margin-bottom: 20px;">Detalhes das Falhas</h2>
      <div class="no-failures">
        <p style="font-size: 16px;">✅ Nenhuma falha encontrada!</p>
      </div>
    </div>

    <footer>
      <p>Relatório automático de capturas de tela e análise de falhas</p>
    </footer>
  </div>

  <script>
    // Simular dados de teste (em produção, isso viria de um JSON)
    const testData = ${fs.existsSync(path.join(reportDir, 'test-data.json')) ? fs.readFileSync(path.join(reportDir, 'test-data.json'), 'utf-8') : '{}'};

    document.querySelectorAll('.failure-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.classList.toggle('active');
        header.querySelector('.toggle').textContent = content.classList.contains('active') ? '▼' : '▶';
      });
    });

    document.querySelectorAll('.html-viewer button').forEach(button => {
      button.addEventListener('click', () => {
        const iframe = button.nextElementSibling;
        iframe.classList.toggle('active');
        button.textContent = iframe.classList.contains('active') ? 'Ocultar HTML' : 'Visualizar HTML';
      });
    });
  </script>
</body>
</html>`;

// Salvar o HTML gerado
const outputPath = path.join(reportDir, 'failure-report.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`✅ Relatório gerado: ${outputPath}`);
