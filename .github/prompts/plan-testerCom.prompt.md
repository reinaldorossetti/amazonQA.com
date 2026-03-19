## Plan: Testes Playwright Full Stack (server + front)

Criar uma suíte de testes automatizados com Playwright cobrindo os fluxos críticos já implementados no front-end e no server, com separação clara entre testes de UI (E2E) e testes de API, dados de teste isolados para execução confiável, e integração pronta para rodar localmente e em CI.

**Steps**
1. Fase 0 — Descoberta e baseline (*concluído neste planejamento*)
   1.1 Consolidar rotas, componentes e endpoints reais já implementados no projeto.
   1.2 Confirmar comandos de inicialização front/server/DB e dependências de seed.
   1.3 Catalogar seletores estáveis existentes (IDs/roles) e pontos frágeis de flakiness.

2. Fase 1 — Bootstrap Playwright no repositório
   2.1 Adicionar Playwright como dependência de desenvolvimento no `package.json` da raiz.  
   2.2 Criar configuração principal `playwright.config.ts` na raiz com:
   - `testsDir` para testes separados de UI e API;
   - `baseURL` para frontend;
   - captura de trace/screenshot/video em falhas;
   - retry condicional para CI;
   - estratégia de `webServer` para subir front (Vite) e server (Next) de forma controlada.
   - timeout global definido em 45s em todos os métodos e globalmente e timeout do expect para 15s.
   - Definir workers para 7 localmente e auto para a CI (ajustável conforme estabilidade).
   2.3 Adicionar scripts NPM na raiz para execução (`test:e2e`, `test:e2e:ui`, `test:e2e:debug`, `test:e2e:headed`, `test:e2e:report`).
   2.4 Atualizar `.gitignore` para artefatos de execução (report, test-results, traces, videos, screenshots).

3. Fase 2 — Estrutura de testes e utilitários reutilizáveis
   3.1 Criar estrutura de pastas de testes com separação por domínio e2e para web e api para backend:
   - `e2e/specs/frontend/`;
   - `e2e/specs/api/`;
   - `e2e/fixtures/`;
   - `e2e/helpers/`;
   - `e2e/data/`.
   3.2 Criar fixtures base para:
   - geração de usuário único por teste/worker;
   - estado autenticado (`storageState`) para cenários protegidos;
   - utilitário de limpeza de carrinho;
   - helper de espera de carregamento sem `sleep` fixo. Crie um fixture de `waitForPageLoad` que aguarde por elementos-chave da página (ex.: título, lista de produtos) para garantir que a página está pronta para interações. E faça uma validação de um elemento específico de cada página para confirmar que o carregamento foi concluído, usando o "await page.waitForSelector(‘#loading’, { state: ‘visible’ })", antes de fazer outras ações.
   3.3 Criar convenção de seletores estáveis (prioridade: `data-testid` > `id` existente > role acessível) e mapear gaps de seletor para pequenos ajustes futuros.

4. Fase 3 — Plano de testes front-end por page/feature/fluxo
   4.1 Catálogo (`/`)
   - TS01.Deve listar produtos ao carregar página.
   - TS02.Deve permitir busca por texto e atualizar contagem.
   - TS03.Deve aplicar filtro por categoria.
   - TS04.Deve mostrar estado vazio quando busca/filtro não retorna itens.
   - TS05.Deve navegar para detalhes ao clicar no produto.

   4.2 Detalhes de produto (`/product/:id`)
   - TS01.Deve exibir dados principais (nome, preço, imagem, descrição técnica).
   - TS02.Deve permitir escolher quantidade e adicionar ao carrinho.
   - TS03.Deve atualizar badge do carrinho após adicionar.
   - TS04.Deve tratar ID inválido com mensagem de produto não encontrado.
   - TS05.Deve permitir voltar para catálogo.

   4.3 Carrinho (`/cart`)
   - TS01.Deve listar itens adicionados e total correto.
   - TS02.Deve atualizar subtotal/total ao alterar quantidade.
   - TS03.Deve remover item e refletir no total e badge.
   - TS04.Deve exibir estado vazio com CTA para catálogo.
   - TS05.Deve manter consistência do carrinho após navegação interna.

   4.4 Checkout e confirmação (`/cart` → `/thank-you`)
   - TS01.Usuário logado: checkout habilitado e navegação para obrigado com resumo.
   - TS02.Usuário não logado: proteção e redirecionamento para `/login?next=/cart`.
   - TS03.Carrinho vazio: bloquear checkout e exibir feedback apropriado.
   - TS04.Página de obrigado: validar itens, total e ação de voltar ao catálogo.

   4.5 Login (`/login`)
   - TS01.Login com credenciais válidas (incluindo persistência em storage/contexto).
   - TS02.Erro para credenciais inválidas.
   - TS03.Validação de campos obrigatórios.
   - TS04.Redirecionamento com parâmetro `next`.
   - TS05.Exibição de saudação/estado autenticado na navegação.
   - TS06.Manter estado autenticado após reload da página.
   - TS07.Prevenir acesso a `/login` para usuário já autenticado (redirecionar para `/`).
   - TS08.Mensagem de erro deve ser genérica, não específica para o campo.

   4.6 Registro (`/register`)
   - TS01.Fluxo PF completo (campos obrigatórios + sucesso).
   - TS02.Fluxo PJ completo (campos obrigatórios + sucesso).
   - TS03.Validação de campos obrigatórios e formatos inválidos.
   - TS04.Tratamento de e-mail/CPF/CNPJ duplicados (mensagens de conflito).

   4.7 Idioma (PT/EN)
   - TS01.Alternância de idioma em runtime.
   - TS02.Persistência da preferência após reload.
   - TS03.Presença de textos esperados no idioma selecionado em páginas críticas.

5. Fase 4 — Plano de testes server (API) com Playwright `APIRequestContext`
   5.1 Produtos
   - `GET /api/products` (lista, filtro por categoria, array vazio para categoria inexistente).
   - `GET /api/products/:id` (sucesso para ID válido, 404 para inexistente).
   - `POST /api/products` (sucesso com campos obrigatórios; 400 para ausência de name/price).
   - `PUT /api/products/:id` (atualização bem-sucedida e 404 para ID inexistente).
   - `DELETE /api/products/:id` (remoção e validação posterior de inexistência).

   5.2 Usuários
   - `POST /api/users/register` sucesso PF/PJ.
   - `POST /api/users/register` conflito para e-mail/CPF/CNPJ já existentes.
   - `POST /api/users/login` sucesso com credenciais válidas.
   - `POST /api/users/login` 401 para inválidas e 400 para payload incompleto.

   5.3 Carrinho
   - `GET /api/cart?userId=` com itens e sem itens.
   - `POST /api/cart` adiciona item e incrementa quantidade para produto repetido.
   - `DELETE /api/cart` remove item existente.
   - Casos de erro (faltando `userId`, `productId`, `cartItemId`).

6. Fase 5 — Estratégia de dados, isolamento e paralelismo
   6.1 Executar seed inicial apenas para dados base (produtos).
   6.2 Gerar usuários únicos por teste/worker (prefixo + timestamp) para evitar colisão de constraints.
   6.3 Evitar compartilhamento de IDs fixos de usuário entre specs paralelas.
   6.4 Definir política de limpeza: remover carrinho por API quando aplicável e evitar dependência entre testes.
   6.5 Configurar workers (local paralelo, CI mais conservador) com retries em cenários instáveis.

7. Fase 6 — Verificação e critérios de aceite
   7.1 Executar suíte frontend e API localmente e validar relatório HTML.
   7.2 Executar suíte em modo headed/UI para depuração dos fluxos críticos.
   7.3 Validar confiabilidade mínima: sem `waitForTimeout` fixo, uso de `waitForURL`/locators estáveis.
   7.4 Publicar resultados no relatório e documentar taxa de sucesso por feature.

8. Fase 7 — Documentação em MD (entrega solicitada)
   8.1 Criar documento de plano em Markdown no repositório (ex.: `planning/Playwright_Test_Plan.md`).
   8.2 Incluir matriz de cobertura por page/feature com casos positivos e negativos.
   8.3 Incluir matriz de cobertura de API por endpoint.
   8.4 Incluir instruções de execução local e CI (pré-condições: DB, seed, server, front).
   8.5 Incluir roadmap incremental (Smoke > Regressão Crítica > Regressão Completa).

**Relevant files**
- `d:\github-projects\tester.com\package.json` — adicionar scripts e dependência Playwright (raiz).
- `d:\github-projects\tester.com\playwright.config.ts` — configuração principal de execução/relatórios/webServer.
- `d:\github-projects\tester.com\.gitignore` — ignorar artefatos de execução de testes.
- `d:\github-projects\tester.com\e2e\specs\frontend\*.spec.ts` — specs por página/feature do front-end.
- `d:\github-projects\tester.com\e2e\specs\api\*.spec.ts` — specs por endpoint do server.
- `d:\github-projects\tester.com\e2e\fixtures\*.ts` — fixtures de autenticação, dados e setup.
- `d:\github-projects\tester.com\e2e\helpers\*.ts` — helpers de seletores/asserções e utilitários.
- `d:\github-projects\tester.com\planning\Playwright_Test_Plan.md` — documento MD com escopo e cobertura dos testes automatizados.
- `d:\github-projects\tester.com\README.md` — seção curta de execução de testes (opcional, recomendado).

**Verification**
1. Confirmar que todos os scripts de teste respondem corretamente (`test:e2e`, `test:e2e:ui`, `test:e2e:report`).
2. Validar que os testes frontend cobrem Catálogo, Detalhes, Carrinho, Checkout, Login, Registro e Idioma.
3. Validar que os testes API cobrem Products, Users e Cart com casos de sucesso e erro.
4. Confirmar execução estável em pelo menos duas rodadas consecutivas sem falhas intermitentes críticas.
5. Validar geração e abertura de relatório HTML com evidências de execução por feature.

**Decisions**
- Incluir tanto UI E2E quanto API tests dentro do Playwright para manter stack de testes única.
- Priorizar cobertura dos fluxos críticos de negócio antes de cenários de borda menos frequentes.
- Usar dados dinâmicos por teste para suportar paralelismo e reduzir flaky por conflito de banco.
- Escopo desta entrega: plano detalhado e matriz de cobertura; implementação dos testes ficará para a fase de execução.

**Further Considerations**
1. Se necessário reduzir tempo inicial, começar com smoke suite (1 cenário feliz por feature) e expandir para regressão completa em ciclos.
2. Caso flakiness persista por seletores, adicionar `data-testid` nos componentes críticos como melhoria incremental.

