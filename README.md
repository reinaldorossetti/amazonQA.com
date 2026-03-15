# Projeto E-Commerce (Clone Amazon UI)

Este projeto é uma aplicação de e-commerce construída com **React** e **Vite**, focada em fornecer uma interface de usuário rica, responsiva e com um design visual inspirado fortemente na Amazon. A aplicação possui um fluxo completo desde a visualização de produtos no catálogo até a finalização da compra no carrinho.

## 🚀 Funcionalidades (Features)

A aplicação foi desenvolvida com o intuito de simular as principais funcionalidades de um e-commerce moderno:

*   **Catálogo de Produtos:** Exibe uma lista de produtos disponíveis em uma grade responsiva.
*   **Busca Integrada:** Uma barra de pesquisas na NavBar que filtra os produtos mostrados no catálogo em tempo real.
*   **Gestão de Carrinho:**
    *   **Adicionar Produtos:** Inclusão de novos itens ao carrinho.
    *   **Atualizar Quantidade:** Alterar o número de itens desejados de um mesmo produto diretamente no carrinho.
    *   **Remover Produtos:** Exclusão de itens do carrinho.
*   **Feedback Visual (Toast Notifications):** Utilização da biblioteca `react-toastify` para apresentar notificações elegantes ao usuário (ex: produto adicionado, produto removido, quantidade atualizada).
*   **Checkout / Finalização:** Uma página de agradecimento ("Thank You Page") simulando o pós-compra, que também se encarrega de limpar os itens do carrinho após a confirmação.
*   **Contador Dinâmico:** O ícone do carrinho na barra de navegação exibe uma contagem exata e em tempo real da quantidade total de itens no carrinho.

## 🧩 Componentes Criados

A estrutura do projeto foi devidamente componentizada para promover a manutenção e o reuso de código. Os principais componentes localizam-se no diretório `src/components/`:

*   **`NavBar`** (localizado em `App.jsx`): Barra de navegação global. Fornece o contêiner de logo, a barra de pesquisa ao estilo Amazon, botões de acesso ao catálogo e o ícone com contador do carrinho.
*   **`Catalog`**: Página inicial do projeto renderizando a lista completa ou filtrada de itens e interagindo com a funcionalidade de busca da NavBar.
*   **`Product`**: Card individual de cada produto do catálogo, exibindo imagem, detalhes, preço e botão para adicionar ao carrinho.
*   **`Cart`**: Página do carrinho de compras, calculando subtotais, apresentando os itens adicionados e o resumo do pedido.
*   **`CartItem`**: Componente de linha/item dentro do carrinho, permitindo a gestão de quantidade (aumentar/diminuir) e a remoção.
*   **`CheckoutButton`**: Componente de botão estilizado focado em conduzir o usuário para a finalização imediata da compra.
*   **`ThankYouPage`**: Página de sucesso renderizada após o "Checkout", exibindo uma mensagem de agradecimento pelo pedido.

## 🎨 Material Design e Tematização (MUI)

Para acelerar o desenvolvimento de interfaces e garantir consistência cross-browser, adotamos o **Material-UI (MUI v5+)** como nossa principal biblioteca de componentes visuais baseada no Material Design.

Fizemos uso avançado do **`ThemeProvider`** e **`createTheme`** para desviar do visual "padrão" do Google e aproxima-lo à identidade de e-commerce similar à Amazon:

*   **Paleta de Cores Customizada:** 
    *   *Primary (Dark Blue)*: `#232f3e` e `#131921` para fundos dominantes, como a NavBar.
    *   *Secondary (Amazon Orange/Yellow)*: `#ff9900`, `#FFD814` e `#FFA41C` focando em chamadas de ação (Call to Action) e destaques de preço.
*   **Tipografia:** Substituímos a família padrão pelo conjunto limpo utilizando estilos de títulos com peso maior (`font-weight: 700`) e variação de cor escura para garantir alto contraste e legibilidade (`#0F1111`).
*   **Sobrescrita de Componentes (StyleOverrides):**
    *   **Buttons:** Retirada do uppercase automático (`textTransform: "none"`), implementando botões perfeitamente alinhados ao estilo "Add to Cart" ou "Buy Now" com bordas coloridas `#FCD200` e fundos amarelados/alaranjados em `:hover`.
    *   **Cards:** Remoção proposital de sombra espessa inicial, substituída por bordas finas `#D5D9D9` e `borderRadius` sútil para uma apresentação mais "clean".
*   **Ícones:** Biblioteca `@mui/icons-material`, destacando o `ShoppingCartOutlined` e svgs customizados.

## 📁 Estrutura de Pastas

Abaixo está a organização principal dos diretórios do projeto e suas responsabilidades:

```text
tester.com/
├── public/              # Arquivos estáticos públicos (ex: favicon) que não passam pelo pipeline do Vite.
├── src/                 # Código-fonte principal da aplicação React.
│   ├── assets/          # Arquivos de mídia, como imagens e ícones.
│   ├── components/      # Componentes React (botões, cards, navbar, carrinho).
│   ├── data/            # Dados estáticos/mocks em JSON para simular a API dos produtos.
│   ├── App.jsx          # Componente raiz que configura rotas e o tema da aplicação.
│   ├── main.jsx         # Ponto de entrada do React que renderiza o App no DOM.
│   └── index.css/App.css# Estilos globais e escopos básicos.
├── package.json         # Gerenciamento de dependências e scripts do projeto.
└── vite.config.js       # Configurações do empacotador Vite.
```

## ⚛️ Padrões e Organização no React

Para manter a base de código escalável, limpa e fácil de dar manutenção, este projeto segue algumas convenções e padrões arquiteturais recomendados para o ecossistema React:

*   **Componentização por Propósito:** Cada arquivo na pasta `src/components/` deve exportar preferencialmente um único componente principal. O nome do arquivo deve corresponder ao nome do componente desenvolvido (ex: `CartItem.jsx` exporta o `<CartItem />`).
*   **Separação de Preocupações (Separation of Concerns):** A lógica complexa e o gerenciamento de estado global (neste caso, na raiz do App) são separados da renderização visual. Componentes filhos, como `Product` e `CartItem`, tendem a ser componentes de apresentação (Presentational Components), recebendo dados e callbacks via *props*.
*   **Props e Callbacks Mapeados:** A comunicação flui de cima para baixo. Ações que afetam múltiplos lugares na tela (como atualizar a quantidade de itens do carrinho) disparam funções enviadas pelos componentes "pai" (no caso, repassadas a partir do `App.jsx`, que atua como *Container/State Manager*).
*   **Estilização Centralizada e Temática:** Ao utilizar Material-UI, optamos por configurar cores, tipologia e overrides de forma global via `ThemeProvider` no `App.jsx`. Componentes individuais herdam esses estilos ou os complementam via a prop `sx={...}`, evitando a proliferação excessiva de arquivos CSS separados e garantindo um visual coeso de E-Commerce (similar a Amazon) em toda iteração do layout.
*   **Uso de Hooks Nativos:** Em vez de classes, o estado e ciclo de vida interativo é gerenciado predominantemente pelo uso de Hooks nativos do **React v18**, notoriamente `useState` e, quando necessário de forma estendida, contextos ou reducers.

## ⚙️ Configurações do Projeto e Como Rodar

Este projeto foi inicializado utilizando o **Vite**, que oferece um tempo de boot quase instantâneo do servidor e *Hot Module Replacement (HMR)* super rápido, com configuração no `vite.config.js`.

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão LTS recomendada: 18.x ou 20.x+)
*   NPM, Yarn ou PNPM instalados na máquina.

### Instalação e Execução

1. **Clone do repositório** (se aplicável):
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd tester.com
   ```

2. **Instalar Dependências:**
   Instale todas as dependências listadas no `package.json` utilizando seu gerenciador de pacotes:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Ambiente de Desenvolvimento (Start):**
   Inicie o servidor de desenvolvimento do Vite executando o comando abaixo. Ele será iniciado geralmente na porta `http://localhost:5173`.
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Gerar Versão de Produção (Build):**
   Para preparar os arquivos minimificados e otimizados para deploy:
   ```bash
   npm run build
   ```
   *Os arquivos ficarão disponíveis na pasta `dist/`.*

### Principais Dependências Catalogadas
*   `react` & `react-dom`
*   `react-router-dom` (Roteamento SPA)
*   `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (Design System)
*   `react-toastify` (Notificações)
*   `vite` & `@vitejs/plugin-react` (Build Toolchain)
