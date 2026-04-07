# Release Notes

## 🚀 Versão 0.4.0 (Backend & Web) / 0.0.1 (Mobile)

### 📱 Mobile (v0.0.1)
- **Início do Projeto Mobile**: Criação da nova estrutura base para o aplicativo móvel, estabelecendo os fundamentos para as futuras features.

### 🌐 Web (v0.4.0)
- **Área do Usuário**: Criação do perfil do usuário contendo:
  - **Consulta de Pedidos**: Os usuários agora podem consultar o histórico e detalhes dos próprios pedidos diretamente do painel de usuário.
  - **Dados de Endereço**: Gerenciamento e visualização de seus dados de endereço atualizados.
- **Painel Administrativo**: Adicionada nova funcionalidade administrativa para gerenciar plataforma.
- **Estruturação do Projeto**: Diversas melhorias estruturais no repositório web para escalabilidade e manutenção.

### ⚙️ Backend (v0.4.0)
- **Migração para TypeScript (server-ts)**: Criação e estruturação do novo pacote de backend completamente tipado em `server-ts`, garantindo maior confiabilidade e tipagem estática (TypeScript).
- **Atualização de Framework**: O backend passou a ser desenvolvido utilizando o **Next.js 16**.
- **Definition of Done (DoD)**: Implementação e fixação oficial do **Definition of Done (DoD)** atualizado no sistema, exigindo métricas elevadas de qualidade para aprovações: validação rigorosa no *TypeScript* (sem `any`) e aprovação nas lints com *zero warnings*.
- **Exclusão Segura via Admin**: 
  - **Exclusão de Usuários**: Implementado endpoint exclusivo para perfis *admin* conseguirem deletar perfis de usuários do sistema.
  - **Exclusão de Produtos**: Endpoint administrativo para exclusão permanente de produtos estabelecido adicionando restrições de integridade, garantindo que a exclusão **só ocorra se não houver pedidos vinculados** ao respectivo produto.
- **Funcionalidades de Admin**: A base do usuário admin foi consolidada, com endpoints criados para listar usuários e facilitar o controle da plataforma, todos acompanhados por rotinas de testes garantindo integridade.

### 🛠️ Testes & DevOps (Pipeline)
- **CI/CD e Esteira de Testes**: Resoluções e ajustes na pipeline (esteira) contínua para evitar blocos indesejados. 
- **Ajustes no E2E/Playwright**: Ajustes de caminhos de arquivos de testes e resolução/atualização nas versões do Playwright (`pw`) para estabilidade máxima nos testes automatizados e integração contínua.
