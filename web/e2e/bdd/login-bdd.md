# Documentação BDD (Behave/Gherkin) — Login Frontend

## Origem dos cenários
- Arquivo-fonte: `web/e2e/specs/frontend/login.spec.ts`
- Suite: `Login`
- Casos mapeados: `TS01` a `TS05`

## Pré-requisitos
- Dependências da pasta raiz e de `web/` devidamente instaladas (ex: `npm install`).
- Aplicação web em execução local ou ambiente de Staging apontado pela variável `BASE_URL`.
- Ambiente E2E provisionado com Playwright e as Fixtures de Mocking do repositório.
- Acesso à constante `LOGIN_VALIDATION` do projeto para extração das mensagens de validações.
- **Massa de Dados (Utilizados nos Testes):**
  - **Usuário Válido (Happy Path):** Utiliza dados de cadastro dinâmicos criados pela fixture `generateUserData()` (contendo e-mail e senha formatados corretamente).
  - **E-mail de Validação Fictício:** Definido em `LOGIN_VALIDATION.testData.validEmail`.
  - **Senha de Falha Padrão:** Definida em `LOGIN_VALIDATION.testData.wrongPassword`.

ADMIN_EMAIL: reiload@gmail.co
ADMIN_PASSWORD: rei2026@QA
NORMAL_EMAIL: reinaldo.rossetti@outlook.co
NORMAL_PASSWORD: qualidade2026@QA

---

## Feature em Gherkin

```gherkin
@login @frontend
Feature: Autenticação de Usuário
  Como visitante da aplicação web
  Quero fornecer minhas credenciais de acesso
  Para visualizar os dados da minha conta com segurança

  Background:
    Given que a aplicação está acessível

  @TS01 @happy-path
  Scenario: Login com sucesso após cadastro de um novo usuário
    Given que o visitante acabou de realizar o cadastro de uma nova conta
    And acessou a página de login
    When o visitante envia as credenciais recém-cadastradas
    Then a plataforma deve autorizar a sessão com sucesso
    And ele deve ser encaminhado para a visualização do painel "/minha-conta"
    And o sistema deve exibir uma saudação contendo em destaque o seu nome

  @TS02 @credenciais-invalidas
  Scenario: Bloqueio de login com credenciais incorretas ou não registradas
    Given que o visitante acessou a página de login
    When o visitante tentar autenticar usando um e-mail que não foi cadastrado
    Then a plataforma não o autorizará acessar a conta
    And deve apresentar um alerta de erro contendo a mensagem de "Credenciais inválidas"

  @TS03 @sem-dados
  Scenario: Bloqueio local de envio por formulário com campos obrigatórios vazios
    Given que o visitante acessou a página de login
    When o visitante acionar o botão de envio sem preencher os campos de e-mail e senha
    Then o formulário não submeterá os dados para o back-end
    And um alerta de erro da interface relatará a obrigatoriedade dos campos

  @TS04 @credenciais-invalidas
  Scenario: Bloqueio de login com senha incorreta
    Given que o visitante acessou a página de login
    When o visitante tentar autenticar usando uma senha invalida
    Then a plataforma não o autorizará acessar a conta
    And deve apresentar um alerta de erro contendo a mensagem de "Credenciais inválidas"

  @TS05 @validacao-limite
  Scenario Outline: Limite máximo de 30 caracteres nos campos de e-mail e senha
    Given que o visitante acessou a página de login
    When o visitante tentar inserir uma string com <quantidade> caracteres aleatórios e especiais nos campos
    Then a interface deve limitar os campos para registrar no máximo 30 caracteres
    And o valor final mantido nos campos deve corresponder exatamente aos primeiros 30 caracteres inseridos

    Examples:
      | quantidade |
      | 250        |
```

## Rastreabilidade das Coberturas (BDD -> Script Playwright)
- **@TS01:** Cobre a especificação `Should successfully log in when providing valid credentials`
- **@TS02:** Cobre a especificação `Should display an error alert when credentials are invalid`
- **@TS03:** Cobre a especificação `Should display a validation message when submitting with empty fields`
- **@TS04:** Cobre a especificação `Should display a validation message when password is empty`
- **@TS05:** Cobre a especificação `Should cap email and password fields to a maximum of 30 characters using special chars payload`
