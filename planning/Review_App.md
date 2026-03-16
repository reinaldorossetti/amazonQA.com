# Walkthrough – Página de Cadastro de Usuário

## O que foi implementado

- **Toggle CPF / CNPJ** — alterna entre Pessoa Física e Jurídica instantaneamente
- **Stepper de 2 passos** — Dados Pessoais → Endereço & Documentos  
- **Auto-preenchimento de endereço** via API ViaCEP ao digitar o CEP  
- **Validação completa** — CPF/CNPJ dígitos verificadores, email, telefone, senhas
- **Indicador de força de senha** — Fraca / Regular / Boa / Forte  
- **Upload de comprovante de residência** (PDF, JPG ou PNG)
- **Link "Cadastre-se"** adicionado na navbar
- **Tabela `users` no banco SQLite** com todos os campos + unicidade de email/CPF/CNPJ

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| [src/components/Register.jsx](file:///d:/github-projects/tester.com/src/components/Register.jsx) | **[NOVO]** Componente completo |
| [src/db/database.js](file:///d:/github-projects/tester.com/src/db/database.js) | Tabela `users` + [registerUser()](file:///d:/github-projects/tester.com/src/db/database.js#166-235) + [getUserByEmail()](file:///d:/github-projects/tester.com/src/db/database.js#236-249) |
| [src/App.jsx](file:///d:/github-projects/tester.com/src/App.jsx) | Rota `/register` + botão "Cadastre-se" no navbar |

---

## Screenshots de verificação

### 1 – Navbar com botão "Cadastre-se"
![Navbar com Cadastre-se](file:///C:/Users/reina/.gemini/antigravity/brain/4c1e39ed-a333-4a30-86b7-7d9a82e2ef6d/homepage_navbar_1773677303314.png)

### 2 – Passo 1: Pessoa Física (CPF)
![Passo 1 PF](file:///C:/Users/reina/.gemini/antigravity/brain/4c1e39ed-a333-4a30-86b7-7d9a82e2ef6d/register_step1_pf_1773677318083.png)

### 3 – Passo 1: Pessoa Jurídica (CNPJ)
![Passo 1 PJ](file:///C:/Users/reina/.gemini/antigravity/brain/4c1e39ed-a333-4a30-86b7-7d9a82e2ef6d/register_step1_pj_1773677328692.png)

### 4 – Passo 2: Endereço com CEP auto-preenchido
![Passo 2 auto-fill](file:///C:/Users/reina/.gemini/antigravity/brain/4c1e39ed-a333-4a30-86b7-7d9a82e2ef6d/register_step2_autofilled_1773677406690.png)

---

## Gravação completa do teste
![Gravação do teste](file:///C:/Users/reina/.gemini/antigravity/brain/4c1e39ed-a333-4a30-86b7-7d9a82e2ef6d/register_page_verification_1773677284239.webp)
