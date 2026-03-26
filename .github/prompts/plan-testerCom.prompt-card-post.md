## Plan: Refatorar POST Cart Token-Only

Refatorar o endpoint `POST /api/cart` para contrato limpo e seguro (usuário derivado exclusivamente do token), com payload em lote (`products[]`), validação forte no backend e testes cobrindo regras de negócio. A abordagem escolhida é breaking change controlada (Opção B), com rejeição de produtos duplicados no mesmo payload e limites de quantidade `min=1` e `max=99`.

**Steps**
1. **Fase 1 — Alinhamento de contrato e impacto (base para implementação)**
   1.1 Definir contrato final do `POST /api/cart`: remover `userId` do body; aceitar `{ products: [{ productId, quantity }] }`; responder com itens inseridos/atualizados e status 201.
   1.2 Atualizar documentação OpenAPI para refletir o novo contrato e regras de validação (campos obrigatórios, limites, erro de duplicidade). *depende de 1.1*
   1.3 Mapear todos os consumidores internos do endpoint para remover envio de `userId`. *paralelo com 1.2*
2. **Fase 2 — Validação de entrada e regras de domínio no backend**
   2.1 Em `POST /api/cart`, obter `userId` somente de `authenticateRequest()`; ignorar/remover qualquer referência a `userId` no body.
   2.2 Validar payload estruturalmente: `products` obrigatório, array não vazio, cada item com `productId` inteiro positivo e `quantity` inteiro entre 1 e 99.
   2.3 Rejeitar `productId` duplicado no mesmo payload com `400` e mensagem explícita. *regra escolhida pelo usuário*
   2.4 Validar existência de `productId` no banco antes de inserir (ou tratar FK com erro semântico 400/404 conforme decisão de API) para evitar 500 genérico.
3. **Fase 3 — Persistência em lote e consistência**
   3.1 Executar inserção/upsert em lote para `products[]` em transação (`BEGIN/COMMIT/ROLLBACK`) para garantir atomicidade da operação.
   3.2 Manter comportamento de soma em conflitos entre requests anteriores (`ON CONFLICT ... quantity = current + incoming`), mas sem permitir duplicado no mesmo payload.
   3.3 Definir retorno padronizado do POST (itens afetados, total de linhas processadas, metadados opcionais).
4. **Fase 4 — Adequação dos clientes internos (frontend)**
   4.1 Ajustar `src/db/api.js` para enviar o novo body (`products[]`) sem `userId`.
   4.2 Ajustar pontos de chamada (`Product.jsx`, `Cart` context/hooks, componentes de ação no carrinho) para o novo método do client.
   4.3 Garantir compatibilidade de UX com validação local já existente (sem depender só do frontend).
5. **Fase 5 — Testes e hardening**
   5.1 Atualizar testes de API existentes para o novo contrato (sem `userId` no body).
   5.2 Adicionar testes de erro: payload vazio, `products` ausente, `quantity` 0, negativa, >99, decimal/string, `productId` inexistente, `productId` duplicado no payload.
   5.3 Adicionar teste de sucesso em lote (múltiplos produtos no mesmo POST) e validação do estado final do carrinho.
   5.4 Verificar regressão no fluxo E2E de checkout e atualização de quantidade.
6. **Fase 6 — Rollout e observabilidade**
   6.1 Revisar mensagens de erro para consistência e debuggabilidade (400/401/403/404/500).
   6.2 Revisar logs de erro de banco/autenticação para evitar vazamento de detalhes sensíveis.
   6.3 Publicar notas de migração interna: endpoint agora token-only + body em lote.

mensagens de erros:
"Não é permitido possuir produto duplicado", 
"Não é permitido ter mais de 1 carrinho", 
"Produto não encontrado", 
"Produto não possui quantidade suficiente"
"Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"

**Relevant files**
- `d:/github-projects/tester.com/server/app/api/cart/route.js` — refatorar `POST` para token-only, validação de `products[]`, regra de duplicidade e persistência em lote.
- `d:/github-projects/tester.com/server/lib/auth.js` — reutilizar `authenticateRequest()` (sem mudanças de regra, apenas consumo no endpoint).
- `d:/github-projects/tester.com/server/lib/db.js` — reutilizar utilitário de query/transação.
- `d:/github-projects/tester.com/docs/swagger/openapi.yaml` — atualizar schema/descrição de `POST /api/cart` para o novo contrato.
- `d:/github-projects/tester.com/src/db/api.js` — alterar client de carrinho para novo payload (`products[]`) sem `userId`.
- `d:/github-projects/tester.com/e2e/specs/api/cart.api.spec.ts` — atualizar e expandir cobertura do endpoint.
- `d:/github-projects/tester.com/e2e/specs/frontend/cart-checkout.spec.ts` — validar que fluxos críticos continuam íntegros após mudança da API.

**Verification**
1. Executar suíte API de carrinho e confirmar sucesso para cenários de lote e falhas esperadas por validação.
2. Executar suíte E2E de carrinho/checkout para garantir ausência de regressão de UX e fluxo completo.
3. Validar contrato OpenAPI contra implementação (request/response/erros) e revisar exemplos atualizados.
4. Testar manualmente `POST /api/cart` com token válido e body em lote, incluindo cenários de duplicidade e limites.

**Decisions**
- Estratégia aprovada: **Opção B — contrato limpo agora** (breaking change controlada).
- Regra de duplicidade no payload: **rejeitar com 400** quando `productId` repetir na mesma requisição.
- Limites de quantidade no backend: **mínimo 1 e máximo 99**.
- Escopo incluído: endpoint POST, client interno, documentação e testes.
- Escopo excluído: versionamento `/api/v2`, mudanças de schema de banco fora do necessário para a refatoração.

**Further Considerations**
1. Status para `productId` inexistente: preferir `400` (payload inválido) vs `404` (recurso não encontrado); recomendação: padronizar em `400` para validação de entrada.
2. Formato de resposta do POST: retornar apenas itens afetados vs carrinho completo; recomendação: itens afetados + manter `GET /cart` para estado completo.
3. Compatibilidade temporária: se necessário reduzir risco, considerar feature flag curta para aceitar contrato antigo por janela limitada.
