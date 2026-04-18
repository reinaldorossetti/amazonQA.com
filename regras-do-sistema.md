# Regras de Negócio — tester.com e-commerce

> **Versão:** 2.0 | **Atualizado em:** 2026-04-18  
> Documento de especificação de regras de negócio e validações por tela. Deve ser mantido atualizado a cada nova funcionalidade.

---

## Sumário

1. [Autenticação — Login](#1-autenticação--login)
2. [Cadastro de Usuário](#2-cadastro-de-usuário)
3. [Catálogo de Produtos](#3-catálogo-de-produtos)
4. [Página de Detalhe do Produto](#4-página-de-detalhe-do-produto)
5. [Carrinho de Compras](#5-carrinho-de-compras)
6. [Checkout e Pagamento](#6-checkout-e-pagamento)
7. [Minha Conta — Painel do Cliente](#7-minha-conta--painel-do-cliente)
8. [Painel Administrativo](#8-painel-administrativo)
9. [Segurança e Dados Sensíveis](#9-segurança-e-dados-sensíveis)
10. [Regras Gerais de API](#10-regras-gerais-de-api)

---

## 1. Autenticação — Login

### Credenciais
| Campo  | Regra |
|--------|-------|
| E-mail | Obrigatório. Espaços no início/fim são removidos (_trim_). Convertido para caixa baixa antes de consultar o banco. |
| Senha  | Obrigatória. Enviada em texto puro via HTTPS para a API, onde é comparada com hash bcrypt + pepper. |

### Validações na API (`POST /api/users/login`)
- Se o e-mail não for encontrado → **HTTP 401** com mensagem genérica `"Invalid credentials."` (nunca informar qual campo está incorreto, por segurança).
- Se a senha não corresponder ao hash → **HTTP 401** com a mesma mensagem genérica.
- Se a conta estiver **inativa** (`is_active = false`) ou **encerrada** (`account_closed_at IS NOT NULL`) → **HTTP 403** `"Account closed or inactive."`.
- Login bem-sucedido retorna `accessToken` (JWT) com expiração configurada + dados de perfil sem campo `password`.

### Sessão e Redirecionamento
- O token JWT é armazenado em memória de contexto (React `AuthContext`).
- Rotas protegidas utilizam o parâmetro `?next=` na URL para redirecionar o usuário de volta após o login. Ex.: `/login?next=/payments`.
- A página "Esqueceu a senha?" está presente mas **ainda não implementada** — deve ser tratada como funcionalidade futura.

---

## 2. Cadastro de Usuário

### Tipo de Pessoa
O sistema suporta dois tipos de cadastro:

| Tipo | Documento Principal | Campos Extras |
|------|---------------------|---------------|
| **Pessoa Física (PF)** | CPF | — |
| **Pessoa Jurídica (PJ)** | CNPJ | Razão Social (obrigatória) |

O tipo é selecionado via toggle na interface. Por padrão: `PF`.

---

### Etapa 1 — Dados Pessoais e Conta

#### Identificação
- **Nome e Sobrenome:** Ambos obrigatórios. Não podem ser compostos apenas por espaços.
- **E-mail:** Obrigatório. Deve respeitar formato RFC simplificado (`usuario@dominio.com`). O sistema rejeita e-mails com espaços ou sem `@` e domínio. Unicidade garantida no banco de dados (`UNIQUE` constraint) — retorna **HTTP 409** se já cadastrado.
- **Razão Social (PJ):** Obrigatória para CNPJ; irrelevante para CPF.

#### Documento Fiscal
- **CPF:**
  - Formato aceito: `000.000.000-00` (máscara automática, max 14 chars).
  - Validação matemática via algoritmo oficial dos dois dígitos verificadores.
  - Sequências com todos os dígitos iguais são inválidas (ex.: `111.111.111-11`).
  - Duplicidade no banco → **HTTP 409**.
- **CNPJ:**
  - Formato aceito: `00.000.000/0000-00` (máscara automática, max 18 chars).
  - Validação matemática via algoritmo oficial.
  - Sequências com todos os dígitos iguais são inválidas.
  - Duplicidade no banco → **HTTP 409**.

#### Telefone
- Obrigatório. Mínimo de **10 dígitos numéricos** (DDD + número). Máscara: `(00) 00000-0000`.

#### Senha
- **Tamanho mínimo:** 12 caracteres.
- **Indicador visual de força** com 4 critérios cumulativos:
  1. Comprimento ≥ 12 caracteres
  2. Ao menos 1 letra **maiúscula** (`[A-Z]`)
  3. Ao menos 1 **número** (`[0-9]`)
  4. Ao menos 1 **caractere especial** (`[^A-Za-z0-9]`)
- Níveis de força exibidos na tela: **Fraca** (0–1 critérios), **Regular** (2), **Boa** (3), **Forte** (4).
- A senha é armazenada exclusivamente como **hash bcrypt** (salt rounds = 12) + pepper via variável de ambiente — nunca em texto puro.

#### Confirmar Senha
- Deve ser identicamente igual ao campo Senha. Qualquer diferença bloqueia o avanço para a próxima etapa.

---

### Etapa 2 — Endereço e Documentos

#### CEP
- Obrigatório. Máscara `00000-000` (8 dígitos). Ao completar 8 dígitos, o sistema consulta automaticamente a API **ViaCEP** e preenche os campos de Logradouro, Bairro, Cidade e Estado.
- CEP não encontrado na ViaCEP → erro exibido no campo, usuário deve corrigir.

#### Campos de Endereço
| Campo | Obrigatório |
|-------|-------------|
| Logradouro (Rua) | ✅ Sim |
| Número | ✅ Sim |
| Cidade | ✅ Sim |
| UF (Estado) | ✅ Sim — máximo 2 caracteres, convertido para maiúsculo (`SP`, `RJ`, etc.) |
| Complemento | ❌ Opcional |
| Bairro | ❌ Opcional |

#### Comprovante de Residência
- Campo opcional para upload de arquivo (PDF, PNG, JPG).
- O arquivo é enviado em formato Base64. O nome do arquivo original é armazenado no banco.

#### Papel padrão
- Todo novo usuário cadastrado recebe automaticamente a role `"user"` na tabela `user_roles`.
- A role `"admin"` só pode ser atribuída manualmente por um administrador.

#### Pós-cadastro
- Após cadastro com sucesso → exibe toast de sucesso e redireciona para a página inicial após 2 segundos.

---

## 3. Catálogo de Produtos

### Acesso
- A listagem de produtos é **pública** — não exige login.

### Busca e Filtros
- **Busca por texto:** Filtra produtos pelo nome (`p.name.toLowerCase().includes(search.toLowerCase())`). A busca é aplicada em tempo real no frontend.
- **Filtro por categoria:** Chips clicáveis. "Todas as Categorias" exibe tudo; categorias específicas filtram por `p.category === selectedCategory`.
- **Filtros especiais (Subnav):**
  - **Mais Vendidos:** Exibe produtos da categoria `"Mais Vendidos"`.
  - **Games:** Exibe produtos da categoria `"Games"`.
  - **Livros:** Exibe produtos da categoria `"Livros"`.
  - **Venda na Amazon:** Exibe produtos cujo nome, descrição, categoria ou fabricante contém o termo "amazon".
  - **Chegue em 15 min:** Exibe produtos com campo `deliveryMinutes ≤ 15` ou que contenham "15 min" na descrição.
  - **Ofertas do Dia:** Aplica desconto automático de **10%** no preço de todos os produtos cujo nome ou descrição contenha termos como "oferta", "promoç", "desconto" ou "% off". O preço original é exibido riscado.

### Adição ao Carrinho
- Qualquer visitante pode adicionar ao carrinho sem estar logado.
- Se o produto já existe no carrinho → a quantidade é **somada** (não duplica o item).
- Se o produto é novo no carrinho → cria novo registro no estado local.
- Notificação toast: sucesso ao adicionar, informativa ao atualizar quantidade.

---

## 4. Página de Detalhe do Produto

- Acessível via `/product/:id`.
- Exibe: imagem, nome, preço, descrição, fabricante, linha e modelo.
- Seletor de quantidade com opções de **1 a 10 unidades**.
- Botão "Adicionar ao Carrinho" envia o produto com a quantidade selecionada.
- Produto com ID inexistente → exibe mensagem de "Produto não encontrado" com botão de retorno ao catálogo.

---

## 5. Carrinho de Compras

### Itens e Quantidades
- **Distinção importante:**
  - **Itens distintos** = contagem de SKUs únicos no carrinho (ex.: 3 produtos diferentes = "Itens (3)").
  - **Total de unidades** = soma das quantidades de todos os itens (ex.: 3+1 = "Subtotal (4 items)").
- O usuário pode alterar a quantidade diretamente no carrinho (campo numérico editável).
- O usuário pode remover um item; isso o exclui completamente do carrinho local.

### Cálculo de Valores
| Campo | Fórmula |
|-------|---------|
| Subtotal | `Σ (item.price × item.quantity)` |
| Frete Total | `Σ (item.shipping_cost × item.quantity)` |
| Total (Grand Total) | `Subtotal + Frete Total` |

### Regras de Frete
- O `shipping_cost` é um atributo por produto — produtos diferentes podem ter fretes diferentes.
- **Frete Grátis:** Se o frete total calculado for **R$ 0,00**, exibe o banner em verde *"Your order qualifies for FREE Shipping"* e o campo de frete exibe **Grátis**.
- **Frete Pago:** Se o frete total for maior que zero, o valor é exibido (ex.: `R$ 15.00`) e somado ao Grand Total. O banner de frete grátis é ocultado.

### Resumo do Pedido (Order Summary)
- Localizado na lateral/inferior do carrinho.
- Campos:
  - **Itens (N):** Quantidade de SKUs distintos.
  - **Frete:** Grátis ou valor em R$.
  - **Total:** Grand Total calculado.
  - **Subtotal (N items):** Destaque exibindo soma de unidades e valor dos produtos.

### Carrinho Vazio
- Quando não há itens, exibe estado vazio com chamada à ação para retornar ao catálogo.

---

## 6. Checkout e Pagamento

### Acesso
- Rota `/payments` é **protegida** — exige autenticação ativa. Usuários não logados são redirecionados com `?next=/payments`.

### Criação do Pedido (Order)
- O pedido é criado via `POST /api/orders` no momento do checkout.
- A API valida: `shippingTotal ≥ 0`, `discountTotal ≥ 0`, e que o carrinho não está vazio.
- **Grand Total negativo** → pedido rejeitado com **HTTP 400**.
- **Idempotência:** A API aceita o header `Idempotency-Key`. Se o mesmo par `(userId, idempotencyKey)` já criou um pedido, retorna o pedido existente sem criar duplicata (**HTTP 200**).
- Número do pedido gerado automaticamente no padrão: `ORD-YYYYMMDD-000001`.
- Ao criar o pedido, o carrinho do usuário no banco (`cart_items`) é limpo automaticamente.

### Métodos de Pagamento
O sistema suporta 4 métodos:

| Método | Campos necessários |
|--------|-------------------|
| **Crédito** | Titular, Número do Cartão, Validade (MM/AA), CVV, Parcelas (1–12) |
| **Débito** | Titular, Número do Cartão, Validade (MM/AA), CVV |
| **PIX** | Nenhum — gera QR code/código |
| **Boleto** | Nenhum — gera código de barras |

- A **bandeira do cartão** é detectada automaticamente pelos primeiros dígitos do número (Visa, Mastercard, Amex, Elo, Hipercard, etc.).
- O número do cartão recebe máscara de grupo de 4 (max 19 dígitos).
- A validade recebe máscara `MM/AA` automática.
- O CVV aceita no máximo 4 dígitos.
- Parcelas disponíveis: **1 a 12x** (somente para crédito).

### Pagamento Dividido (Split)
- O usuário pode dividir o pagamento entre **dois métodos distintos**.
- Regras do split:
  - O primeiro e o segundo método **não podem ser iguais**.
  - O valor do primeiro método deve ser maior que zero.
  - O valor restante (`Grand Total - Primeiro valor`) também deve ser maior que zero.
- O sistema processa os dois pagamentos sequencialmente. Se qualquer um for `"failed"`, exibe erro e para o fluxo.

### Status do Pagamento
- `authorized` → Pedido confirmado; exibe toast de sucesso.
- `pending` → Pedido em processamento (comum em PIX/Boleto); exibe toast informativo.
- `failed` → Pagamento negado; exibe erro; o pedido não é concluído.

### Pós-Compra
- Após pagamento bem-sucedido (ou pendente): o carrinho local (estado React) é **zerado**.
- O usuário é redirecionado para `/thank-you` com os dados do pedido.

---

## 7. Minha Conta — Painel do Cliente

### Proteção de Rota
- Todas as sub-rotas de `/minha-conta` são protegidas. Usuários não autenticados são redirecionados para `/login?next=<rota_atual>`.

### Seções Disponíveis

| Rota | Descrição |
|------|-----------|
| `/minha-conta` | Dashboard inicial com acesso rápido |
| `/minha-conta/dados` | Visualização e edição de dados pessoais |
| `/minha-conta/endereco` | Visualização e edição do endereço principal |
| `/minha-conta/pedidos` | Listagem de pedidos do usuário autenticado |
| `/minha-conta/pedidos/:id` | Detalhe de um pedido específico |

### Pedidos
- A API retorna pedidos paginados (padrão: `page=1`, `pageSize=20`, max `100` por página).
- O usuário vê apenas **seus próprios pedidos** — nunca pedidos de outros usuários.
- A ordenação padrão é por `created_at DESC` (mais recentes primeiro).

---

## 8. Painel Administrativo

### Controle de Acesso
- As rotas `/minha-conta/admin`, `/minha-conta/admin/produtos` e `/minha-conta/admin/usuarios` exigem autenticação **com role `"admin"`** na tabela `user_roles`.
- Usuário logado sem role admin que tentar acessar → redirecionado para `/minha-conta`.

### Gestão de Produtos (Admin)
- Administradores podem criar produtos com: nome, preço, descrição, categoria, imagem, fabricante, linha, modelo e **custo de frete** (`shipping_cost`).
- Campos obrigatórios para criação: `name` e `price`.
- O endpoint `POST /api/products` exige autenticação de admin (**HTTP 403** para não-admins).

### Gestão de Usuários (Admin)
- Administradores podem visualizar e gerenciar usuários cadastrados.
- O endpoint `GET /api/orders` com parâmetro `userId` filtra pedidos de qualquer usuário (admin only).

---

## 9. Segurança e Dados Sensíveis

| Prática | Implementação |
|---------|---------------|
| Hash de senha | `bcrypt` com `saltRounds = 12` + variável de ambiente `BCRYPT_PEPPER` |
| Token de acesso | JWT — não é armazenado em cookie, fica em memória do contexto React |
| Dados de cartão | Não são armazenados no backend — apenas processados e enviados ao gateway |
| CPF/CNPJ no banco | Armazenados apenas com dígitos (sem pontuação) |
| Erros de autenticação | Sempre com mensagem genérica — nunca revelam qual campo está errado |
| Conta inativa | Bloqueio no login com status `403`, informando que a conta foi encerrada |
| Idempotência | Evita duplo processamento de pedidos via chave no header da requisição |

---

## 10. Regras Gerais de API

- **Autenticação:** Rotas protegidas exigem header `Authorization: Bearer <token>`.
- **Carrinho e pedido negativo:** Grand Total não pode ser negativo — a API rejeita com HTTP 400.
- **Items duplicados no pedido:** A API rejeita arrays de items com `productId` repetido.
- **Produtos inexistentes no checkout:** Retorna HTTP 400 `"Product not found at checkout"`.
- **Paginação:** `pageSize` máximo de 100 para listagem de pedidos.
- **Moeda padrão:** BRL (Real Brasileiro) — definida no momento de criação do pedido.
- **Snapshot de preço:** O preço do produto é capturado no momento da criação do pedido (`unit_price_snapshot`) — alterações futuras de preço não retroagem pedidos anteriores.

---

*Documento mantido pela equipe de desenvolvimento. Para sugestões, abrir issue no repositório.*
