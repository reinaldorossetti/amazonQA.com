## Plano: Projeto Mobile Kotlin Multiplataforma (KMM) — AmazonQA

**Resumo:**
Desenvolver um app mobile multiplataforma (Android/iOS) em Kotlin (KMM), consumindo os mesmos endpoints REST do backend `server-ts` (Next.js). O app cobre as principais features do frontend web: catálogo, login/cadastro, carrinho, pedidos, pagamentos, área logada/admin, seguindo Clean Code, SOLID, arquitetura em camadas e checklist de qualidade do projeto.

---

### 1. Preparação do Projeto
- Criar pasta `mobile-kotlin` na raiz do monorepo.
- Inicializar projeto KMM (Kotlin 2.x, Gradle 8+, Java 22, target 22).
- Configurar multiplataforma: Android (minSdk 34), iOS (target 15+).
- Adicionar README inicial, estrutura de pastas e documentação de arquitetura.

### 2. Arquitetura e Fundamentos
- Definir arquitetura Clean (camadas: Presentation, Domain, Data, Network).
- Usar Koin/Hilt para DI, kotlinx.serialization, ktor-client, coroutines, Flow/StateFlow.
- Definir models compartilhados (User, Product, Cart, Order, Payment, etc) compatíveis com payloads do backend.
- Implementar camada de autenticação JWT (login, registro, refresh, storage seguro do token).
- Configurar testes unitários (KotlinTest/JUnit5) e cobertura mínima 80%.

### 3. Features Essenciais (MVP)
- **Login/Cadastro:**  
  - POST `/api/users/login`, `/api/users/register`.
  - Persistência segura do token.
- **Catálogo de Produtos:**  
  - GET `/api/products`, `/api/products/:id`.
  - Busca, filtro por categoria, detalhes.
- **Carrinho:**  
  - Adicionar/remover itens, quantidade, subtotal.
  - Integração com backend (se disponível) ou local fallback.
- **Pedidos:**  
  - POST `/api/orders` (checkout), GET `/api/orders`, detalhes.
  - Idempotency-Key no checkout.
- **Pagamentos:**  
  - Tela de pagamento, split payment, métodos: cartão, PIX, boleto.
  - POST `/api/orders/:id/payments`.
- **Área Logada:**  
  - Perfil, histórico de pedidos, logout.
- **Internacionalização:**  
  - Suporte PT/EN, persistência de idioma.

Siga as regras de Negocio: https://reinaldorossetti.github.io/tester.com/regras-do-sistema.html

### 4. Features Avançadas
- **Admin:**  
  - Listar usuários, produtos, editar/excluir (se autorizado).
- **Notificações e feedbacks:**  
  - Toasts, loading, erros amigáveis.
- **Acessibilidade e responsividade.**

### 5. Qualidade, Testes e CI
- Cobertura mínima 80% (unitários, integração, UI tests Android/iOS).
- Lint, formatação (ktlint/detekt), análise estática.
- Scripts de build/teste/documentação.
- Documentação de arquitetura e decisões.

### 6. Checklist de Qualidade (DoD)
- Mudança implementada no domínio/pasta correta.
- Sem chamadas HTTP diretas em UI (usar camada de dados/service).
- Guards de autenticação/admin.
- Testes atualizados e cobrindo regras.
- Contratos revisados conforme payloads do backend.
- Lint, validação e cobertura.
- Documentação e rastreabilidade.
- Riscos e impactos descritos em PRs.

---

**Arquivos e Estrutura Crítica**
- `mobile-kotlin/build.gradle.kts`, `settings.gradle.kts` — config raiz.
- `mobile-kotlin/shared/` — código multiplataforma (models, network, domain, usecases).
- `mobile-kotlin/androidApp/`, `mobile-kotlin/iosApp/` — camadas nativas.
- `mobile-kotlin/shared/src/commonMain/kotlin/...` — Presentation, Domain, Data, Network.
- `mobile-kotlin/shared/src/commonTest/kotlin/...` — testes.

**Verificação**
- Build e testes locais (Android/iOS).
- Testes de integração com backend (mock e real).
- Validação manual dos fluxos críticos (login, catálogo, checkout, pagamento).
- Cobertura e lint automatizados.
- Documentação atualizada.

**Decisões**
- Kotlin 2.x, Java 22, target 23+.
- Ktor-client, kotlinx.serialization, Koin/Hilt, coroutines, multiplatform libraries.
- Clean Architecture, SOLID, checklist de qualidade do projeto web.
- Integração RESTful com server-ts, payloads compatíveis.
- Testes e documentação obrigatórios.

**Considerações Finais**
- Validar endpoints e payloads com backend real e mocks.
- Adaptar flows para mobile (UX, navegação, feedbacks).
- Revisar arquitetura e dependências periodicamente.

## 🎨 Paleta Visual de Cores do Projeto

O visual do projeto segue a identidade Amazon, com tons escuros, laranja, amarelo e azul. Abaixo, a paleta principal utilizada no frontend e dashboards:

| Cor         | Exemplo Visual | Hex       | Uso Principal                      |
|-------------|:-------------:|:---------:|------------------------------------|
| Primária    | <span style="display:inline-block;width:32px;height:20px;background:#131921;border:1px solid #ccc"></span> | #131921 | Header, fundo principal, botões    |
| Secundária  | <span style="display:inline-block;width:32px;height:20px;background:#FF9900;border:1px solid #ccc"></span> | #FF9900 | Botões, destaques, logo           |
| Tertiária   | <span style="display:inline-block;width:32px;height:20px;background:#232f3e;border:1px solid #ccc"></span> | #232f3e | Menus, rodapé, áreas secundárias   |
| Background  | <span style="display:inline-block;width:32px;height:20px;background:#F7F7F7;border:1px solid #ccc"></span> | #F7F7F7 | Fundo geral da aplicação           |
| Amarelo Btn | <span style="display:inline-block;width:32px;height:20px;background:#FFD814;border:1px solid #ccc"></span> | #FFD814 | Botão "Comprar"                   |
| Azul Link   | <span style="display:inline-block;width:32px;height:20px;background:#007185;border:1px solid #ccc"></span> | #007185 | Links, textos ativos               |
| Azul Claro  | <span style="display:inline-block;width:32px;height:20px;background:#00A8E1;border:1px solid #ccc"></span> | #00A8E1 | Links secundários                  |
| Verde OK    | <span style="display:inline-block;width:32px;height:20px;background:#22c55e;border:1px solid #ccc"></span> | #22c55e | Indicador de estoque, sucesso      |
| Vermelho    | <span style="display:inline-block;width:32px;height:20px;background:#ef4444;border:1px solid #ccc"></span> | #ef4444 | Erros, falhas em testes            |
| Laranja Mid | <span style="display:inline-block;width:32px;height:20px;background:#f59e0b;border:1px solid #ccc"></span> | #f59e0b | Alertas, badges                    |
| Azul Métrica| <span style="display:inline-block;width:32px;height:20px;background:#60a5fa;border:1px solid #ccc"></span> | #60a5fa | Dashboards, métricas      

### 6.4 Definition of Done (DoD) para Pull Requests

Uma feature/correção só é considerada pronta quando atende, no mínimo, os critérios abaixo:

1. **Funcionalidade**
	- comportamento implementado conforme regra de negócio;
	- sem regressão visível nos fluxos principais.

2. **Arquitetura e organização**
	- código inserido na pasta/domínio correto;
	- UI não acoplada diretamente a chamadas HTTP fora de `src/db/api.js`;
	- contextos usados apenas para estado transversal (evitar "contexto-de-tudo").

3. **Qualidade de código**
	- lint sem erros bloqueantes;
	- legibilidade mantida (nomes, funções e componentes claros);
	- sem duplicação desnecessária de lógica.

4. **Testes e validação**
	- testes unitários/componente atualizados quando aplicável;
	- contratos atualizados quando houver mudança de payload/semântica de API;
	- validação e2e dos fluxos críticos impactados.

5. **Documentação e rastreabilidade**
	- documentação atualizada (quando houver mudança arquitetural/fluxo);
	- PR com descrição clara de impacto, risco e plano de rollback (quando necessário).

---

## 7) Checklist padrão de PR (copiar e usar)

```md
## Checklist de qualidade

- [ ] Mudança implementada no domínio/pasta correta
- [ ] Rotas/guards mantidos para auth/admin quando aplicável
- [ ] Testes unitários/componentes atualizados
- [ ] Contrato (Pact) revisado quando houver mudança de payload
- [ ] Fluxo e2e impactado validado
- [ ] Lint e validações locais executados
- [ ] Documentação atualizada (`regras-do-sistema.md`, se necessário)
- [ ] Riscos e impactos descritos na PR