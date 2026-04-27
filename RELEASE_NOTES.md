# 📊 Lançamento Tests Dashboard: Versão 0.2.0 🎯

É com orgulho que apresentamos a mais nova versão do nosso **Dashboard de Testes Automáticos**! Esta atualização (`v0.2.0`) traz uma reformulação arquitetural profunda, novas métricas de qualidade e uma esteira de CI/CD muito mais otimizada e inteligente.

Confira as grandes novidades:

### 📈 Métricas de Eficiência de QA (À Prova de Falhas)
- Inovamos com a nova seção de **Eficiência de QA** que calcula automaticamente dados cruciais como ROI, Densidade de Defeitos e Vazamento (Leakage).
- **Mecanismo de Fallback Inteligente**: O dashboard agora é resiliente a falhas de persistência na esteira. Se os dados consolidados do JSON falharem, o sistema calcula métricas dinamicamente para garantir que as informações nunca fiquem vazias.

### 📱 Integração Nativa com Mobile (Android)
- **Visibilidade Multi-plataforma**: O dashboard agora consome e exibe resultados de testes instrumentados (Espresso) e unitários (Robolectric) do projeto `mobile-kotlin`.
- **Métricas Unificadas**: Os dados de automação mobile agora contribuem para o cálculo global de ROI e cobertura de testes da plataforma, oferecendo uma visão 360º da qualidade do ecossistema.

# 📱 Lançamento Mobile KMM: Versão 0.2.0 🚀

Fala, comunidade! É com muito orgulho que anuncio a mais nova atualização do nosso **App Mobile** do ecossistema AmazonQA. Totalmente escrito em **Kotlin Multiplatform (KMM)**, esta versão traz grandes refinamentos visuais, correção de cálculos essenciais e a tão esperada área de gestão administrativa direto do celular! 📲

### 🚀 Principais Funcionalidades Mobile
- **🛒 Carrinho de Compras**: Experiência de compra fluída com adição de produtos em tempo real, ajuste de quantidades e cálculo dinâmico de frete e subtotal.
- **📦 Gestão de Pedidos (Orders)**: Acompanhamento completo do ciclo de vida do pedido, desde a confirmação de pagamento até o resumo final com QR Code para PIX e código de barras para boletos.
- **🔐 Autenticação Segura**: Sistema de login e registro robusto com validações em tempo real e persistência segura de tokens JWT.
- **👨‍💼 Painel Administrativo**: Área exclusiva para gestão de estoque e produtos diretamente pelo aplicativo.

Confira os destaques do que fizemos:

### 🛒 Carrinho de Compras
- **Subtotal de Alta Precisão**: Identificamos e resolvemos o bug de cálculo no carrinho! Atualizamos a lógica para somar perfeitamente as quantias e valores utilizando `derivedStateOf`, garantindo excelente precisão e reatividade imediata no frontend.

### 🎨 Design Premium & Novo Branding
- Lançamos um **novo ícone de aplicativo Premium** destacando as diretrizes de QA e a identidade visual "AmazonQA".
- Otimização de UI: Designer minimalista e profissional.

### 🛡️ Segurança na Criação de Contas
- **Validação Client-Side Ativa**: Adicionamos validação inteligente na tela de "Criar Conta". Agora, tentativas de cadastro com campos vazios disparam mensagens de erro claras e amigáveis diretamente na UI antes mesmo de bater na API.

### 🤖 Automação de Testes Mobile (Android)
- **Cobertura Robusta**: Implementamos uma suíte completa com **47 testes automatizados**, sendo 26 testes unitários de UI (JVM/Robolectric) para execução ultra-rápida e 21 testes instrumentados (Espresso) que validam o fluxo real no emulador.
- **Esteira CI/CD Dedicada**: Lançamos o `mobile-e2e-pipeline.yml`, uma pipeline inteligente que orquestra o backend em Docker e o emulador Android simultaneamente no GitHub Actions.
- **Integração com Dashboard**: Agora os resultados mobile aparecem em tempo real no nosso **Dashboard de Qualidade**, com métricas de ROI e taxa de sucesso unificadas.
- **Evidências Visuais**: 100% dos testes geram screenshots automáticos, facilitando a identificação de bugs visuais diretamente pela esteira de CI.

---

# 🚀 Novidades no Ar! Versão 0.5.0 (Plataforma Web) Disponível! 🌐

Fala, rede! 👋 É com muita alegria que compartilho os avanços da nossa plataforma de E-commerce. Esta versão traz um salto gigante em **autonomia de gestão** e **infraestrutura robusta**. Confira os destaques:

---

### 👩‍💻 Nova Área de Suporte (CRUD de Produtos)
Criamos um espaço exclusivo para o nosso time de suporte brilhar! Agora, sem precisar acessar códigos ou banco de dados, eles podem:
*   ✨ **Criar** novos produtos em segundos.
*   📝 **Editar** informações, preços e categorias.
*   🗑️ **Deletar** itens (com validação de segurança para não afetar pedidos ativos).
*   🔍 **Buscar** e filtrar o catálogo com alta performance.

![Novo Painel de Gestão para Suporte](https://github.com/reinaldorossetti/amazonQA.com/blob/main/docs/screenshots/gest%C3%A3o-de-produto.png)

---

### 🚢 Infraestrutura Inteligente com Docker
Adeus ao "na minha máquina funciona"! 😅 Agora, todo o nosso ecossistema — Backend (Next.js), Frontend (React) e Banco de Dados (Postgres) — roda em **containers Docker**. 
*   Basta um comando (`docker compose up`) e o ambiente está pronto em qualquer lugar.
*   Ambiente de desenvolvimento idêntico ao de produção.

![Infraestrutura Docker Orquestrada](./docs/screenshots/docker.png)

---

### 🛠️ Gestão de Frete Dinâmica
Atendendo a pedidos, implementamos o campo `shipping_cost`. 📦 
*   Agora podemos definir frete grátis ou valores específicos para cada item.
*   O carrinho de compras calcula automaticamente o total e o subtotal, garantindo transparência total para o cliente.

![Interface Intuitiva de Edição de Produtos](https://github.com/reinaldorossetti/amazonQA.com/blob/main/docs/screenshots/editar_produto.png)

---

### ✅ Qualidade Acima de Tudo
Continuamos firmes no nosso **DoD (Definition of Done)**:
*   🧪 **Cobertura de API Expandida**: Alcançamos a marca de **100 testes de API**! 💯 Adicionamos 27 novos testes focados em cenários negativos (validação de dados, segurança, limites de estoque e permissões), garantindo que nossa API seja resiliente a erros e tentativas de acesso indevido.
*   🛡️ **Segurança**: Novos papéis de acesso (`isSupport`) via JWT e validações cross-user em endpoints críticos.
*   🎭 **Testes E2E**: Cobertura ampliada com Playwright para validar fluxos complexos de frete e checkout em múltiplos navegadores.
*   💎 **Design Premium**: Dashboard refatorado com arquitetura modular e visual premium para acompanhamento em tempo real.

---

💡 **O que achou dessas atualizações?** Comente aqui embaixo! 🚀

#SoftwareEngineering #WebDevelopment #ReactJS #NextJS #Docker #QualityAssurance #Ecommerce #ProductManagement
