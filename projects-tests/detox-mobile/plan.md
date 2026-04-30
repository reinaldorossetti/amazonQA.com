## Planejamento: Testes mobile com Detox

Objetivo
- Implementar uma suíte inicial de testes end-to-end para o aplicativo mobile usando Detox, organizados no padrão Page Objects e com specs que reproduzem as mesmas features dos testes instrumentados em `mobile-kotlin/androidApp/src/androidTest`.

Escopo inicial
- Autenticação: tela de login, fluxo de registro, erros de credenciais.
- Catálogo: header, carregamento de produtos, badge do carrinho.
- Pedidos/Checkout: adicionar ao carrinho, página do carrinho, tela de checkout e validação de autenticação.

Estrutura de pastas (criadas)
- `src/pages/` → Page Objects (Login, Register, Catalog, Cart, Checkout, Base)
- `spec/` → Specs (auth.spec.js, catalog.spec.js, orders.spec.js)

Padrão Page Objects
- Cada page object exporta métodos atômicos (ex.: `enterEmail`, `tapContinue`, `expectHeader`) e helpers compostos (ex.: `performLogin`).
- Helpers comuns ficam em `BasePage` (waitFor, waitForText).

Mapeamento das features (Kotlin -> Detox)
- `AuthInstrumentedTests`, `UserLoginInstrumentedTests`, `UserRegistrationInstrumentedTests` → `spec/auth.spec.js`
- `CatalogInstrumentedTests` → `spec/catalog.spec.js`
- `OrderInstrumentedTests` → `spec/orders.spec.js`

Passos propostos
1. Criar estrutura de pastas e page objects (feito).
2. Implementar specs que replicam os casos de teste existentes (feito — placeholders/implementações iniciais).
3. Adicionar configuração do Detox (package.json + detox config) e integração CI (opcional).
4. Executar testes em emulador e ajustar seletores (IDs / testIDs) conforme a app expõe elementos.

Requisitos (pré-requisitos)
- Node.js + npm/yarn
- Detox (instalado como dependência dev)
- Android SDK e emulador configurado (para executar testes em `android`)

Como rodar (exemplo)
1. Instalar dependências:
```
npm install
```
2. Iniciar o emulador Android
3. Rodar os testes (exemplo):
```
npx detox test --configuration android.emu.debug
```

Observações
- Os seletores usados nestes page objects assumem que a aplicação expõe `testTag`/`testID` compatíveis (ex.: `login_email_field`, `amazon_header_logo`). Pode ser necessário ajustar para `contentDescription` ou resourceId dependendo de como a build nativa expõe os identificadores.

---
Arquivo gerados: `src/pages/*` e `spec/*` (tests iniciais). Ajustes finos de configuração Detox e dependências ficam para o próximo passo.
