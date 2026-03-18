# Captura de Tela em Caso de Falha - Documentação

## 📸 Como Funciona

O Playwright foi configurado para capturar automaticamente as telas em caso de falha dos testes. Isso inclui:

1. **Screenshots PNG** - Captura da tela no momento exato da falha
2. **Dump HTML** - Conteúdo completo do HTML da página
3. **Vídeo** - Gravação do teste (em caso de falha)
4. **Trace** - Informações detalhadas de execução (em primeira tentativa de retry)

## 🎯 Configuração Atual

### arquivo: `playwright.config.ts`

```typescript
reporter: [
  ['list'],
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'junit-report.xml' }],
],
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
}
```

## 📂 Estrutura de Armazenamento

Após executar os testes, os arquivos são organizados em:

```
playwright-report/
├── index.html              # Relatório principal
├── failure-report.html     # Relatório customizado de falhas
├── test-data.json          # Dados dos testes
└── trace/                  # Arquivos de trace
    └── [test-name].trace

e2e/screenshots/
├── [test-name]-[timestamp].png   # Screenshots
└── [test-name]-[timestamp].html  # HTMLs capturados
```

## 🚀 Usando os Relatórios

### Visualizar Relatório Padrão
```bash
npm run test:e2e:report
```
Isto abrirá o relatório HTML completo do Playwright com:
- Lista de todos os testes
- Screenshots das falhas
- Trace de execução
- Vídeos (se disponível)

### Visualizar Relatório de Falhas Customizado
```bash
npm run test:e2e:failure-report
```
Isto gerará e abrirá um relatório customizado focado nas falhas com:
- Sumário de testes falhados
- Screenshots para cada falha
- Visualizador de HTML
- Links para detalhes

## 💡 Dicas de Uso

### 1. Executar Testes em Modo Headed (com Browser Visível)
```bash
npm run test:e2e:headed
```
Isso facilita ver o que está acontecendo durante a falha.

### 2. Executar com Debug
```bash
npm run test:e2e:debug
```
Pausa a execução para inspeção interativa.

### 3. Executar com UI Interativa
```bash
npm run test:e2e:ui
```
Interface gráfica interativa do Playwright.

## 🔍 Analisando Screenshots

Quando um teste falha:

1. **Screenshot PNG** mostra o estado visual da página
2. **HTML capturado** permite inspecionar o DOM completo
3. **Trace** fornece timeline completo de ações

Exemplo de análise:
- Verifique o screenshot para entender o estado visual
- Abra o HTML para inspecionar elementos
- Use o trace para ver a sequência de eventos

## 📊 Relatório JUnit

Um arquivo `junit-report.xml` é gerado automaticamente para integração com CI/CD:
- GitLab CI
- GitHub Actions
- Jenkins
- Azure DevOps

## 🛠️ Customização Adicional

### Adicionar Mais Screenshots Manualmente

Em um teste, você pode capturar screenshots adicionais:

```typescript
test('TS01 - Example', async ({ page }) => {
  await page.goto('/');
  
  // Captura automática (solo-on-failure)
  await page.screenshot({ path: 'my-screenshot.png', fullPage: true });
  
  // Continuar teste...
});
```

### Capturar HTML Manualmente

```typescript
const content = await page.content();
fs.writeFileSync('page.html', content, 'utf-8');
```

## 📝 Integração com CI/CD

Para pipelines CI/CD, configure o upload de artefatos:

### GitHub Actions
```yaml
- name: Upload Playwright Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### GitLab CI
```yaml
artifacts:
  when: always
  paths:
    - playwright-report/
  reports:
    junit: junit-report.xml
```

## ✅ Checklist de Troubleshooting

- [ ] Verifique se os screenshots estão sendo capturados em `playwright-report/`
- [ ] Confirme que `screenshot: 'only-on-failure'` está na configuração
- [ ] Certifique-se de que o diretório `playwright-report/` tem permissões de escrita
- [ ] Para CI/CD, verifique se o diretório é preservado após a execução
- [ ] Se usar Docker, monte o volume para `playwright-report/`

## 🎬 Exemplo de Saída

Após executar `npm run test:e2e` com falhas:

```
Running 30 tests using 7 workers
...
3 failed
27 passed

To show HTML report run:
  npx playwright show-report

Para relatório de falhas customizado:
  npm run test:e2e:failure-report
```

---

**Última atualização:** 18 de março de 2026
