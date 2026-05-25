# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend/payments-card-brands.spec.ts >> Payments - Card Brands >> TS04 should capture screenshot for each card brand before confirmation
- Location: e2e/specs/frontend/payments-card-brands.spec.ts:140:3

# Error details

```
Test timeout of 50000ms exceeded.
```

```
Error: locator.click: Test timeout of 50000ms exceeded.
Call log:
  - waiting for getByTestId('payments-card-number-input').first()
    - locator resolved to <input value="" type="text" inputmode="numeric" aria-invalid="false" autocomplete="cc-number" id="payments-card-number-input" data-element-id="payments-card-number-input" aria-describedby="payments-card-number-input-helper-text" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-15v65ck"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Logo" [ref=e5]:
        - /url: /
        - img "Logo" [ref=e6]
      - link "Navegue pelo Catálogo" [ref=e7]:
        - /url: /
        - paragraph [ref=e8]: Navegue pelo
        - paragraph [ref=e9]: Catálogo
      - generic [ref=e10]:
        - generic [ref=e11] [cursor=pointer]: Todos ▾
        - textbox "Pesquisa amazonQA.com" [ref=e12]
        - img [ref=e14] [cursor=pointer]
      - generic [ref=e16] [cursor=pointer]:
        - img [ref=e17]
        - paragraph [ref=e19]: pt
      - generic [ref=e20]:
        - link "Olá, Payment" [ref=e21]:
          - /url: /minha-conta
          - paragraph [ref=e22]: Olá,
          - paragraph [ref=e23]: Payment
        - img [ref=e25] [cursor=pointer]
      - link "1 Carrinho" [ref=e27]:
        - /url: /cart
        - generic [ref=e28]:
          - generic [ref=e29]: "1"
          - img [ref=e30]
        - paragraph [ref=e35]: Carrinho
  - generic [ref=e36]:
    - link "Todos" [ref=e37] [cursor=pointer]:
      - /url: /
      - img [ref=e38]
      - paragraph [ref=e40]:
        - strong [ref=e41]: Todos
    - link "Venda na Amazon" [ref=e42] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e43]: Venda na Amazon
    - link "Chega em 15 min" [ref=e44] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e45]: Chega em 15 min
    - link "Ofertas do Dia" [ref=e46] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e47]: Ofertas do Dia
    - link "Mais Vendidos" [ref=e48] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e49]: Mais Vendidos
    - link "Games" [ref=e50] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e51]: Games
    - link "Livros" [ref=e52] [cursor=pointer]:
      - /url: /
      - paragraph [ref=e53]: Livros
    - generic [ref=e55] [cursor=pointer]:
      - generic [ref=e56]:
        - paragraph [ref=e58]: C
        - paragraph [ref=e59]: vs
        - paragraph [ref=e61]: "N"
      - generic [ref=e62]:
        - paragraph [ref=e63]: "AO VIVO: QUINTA-FEIRA,"
        - paragraph [ref=e64]: 20:30
  - generic [ref=e65]:
    - paragraph [ref=e67]: amazonnow
    - link "Compras anteriores" [ref=e68]:
      - /url: "#"
    - link "Ofertas" [ref=e69]:
      - /url: "#"
    - link "Categorias ∨" [ref=e70]:
      - /url: "#"
    - link "Saiba mais" [ref=e71]:
      - /url: "#"
    - link "Ajuda" [ref=e72]:
      - /url: "#"
  - generic [ref=e75]:
    - generic [ref=e76]:
      - heading "Pagamento" [level=4] [ref=e77]
      - paragraph [ref=e78]: Escolha como deseja pagar seu pedido.
      - heading "Método de pagamento" [level=6] [ref=e79]
      - generic [ref=e80]:
        - button "Crédito Visa, Master, Elo..." [ref=e82] [cursor=pointer]:
          - generic [ref=e83]:
            - paragraph [ref=e84]: Crédito
            - text: Visa, Master, Elo...
        - button "Débito Débito online" [ref=e86] [cursor=pointer]:
          - generic [ref=e87]:
            - paragraph [ref=e88]: Débito
            - text: Débito online
        - button "PIX Aprovação rápida" [ref=e90] [cursor=pointer]:
          - generic [ref=e91]:
            - paragraph [ref=e92]: PIX
            - text: Aprovação rápida
        - button "Boleto Pagamento em até 3 dias úteis" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]:
            - paragraph [ref=e96]: Boleto
            - text: Pagamento em até 3 dias úteis
      - generic [ref=e97] [cursor=pointer]:
        - generic [ref=e98]:
          - checkbox "Usar 2 métodos de pagamento" [ref=e99]
          - img [ref=e100]
        - generic [ref=e102]: Usar 2 métodos de pagamento
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]: Nome no cartão
          - generic [ref=e106]:
            - textbox "Nome no cartão" [ref=e107]: João da Silva
            - group:
              - generic: Nome no cartão
        - generic [ref=e108]:
          - generic [ref=e109]: Número do cartão
          - generic [ref=e110]:
            - textbox "Número do cartão" [active] [ref=e111]: 6376 0100 0000 0000
            - group:
              - generic: Número do cartão
          - paragraph [ref=e112]: A bandeira é detectada automaticamente.
        - generic [ref=e113]:
          - generic [ref=e114]:
            - generic [ref=e115]: Validade (MM/AA)
            - generic [ref=e116]:
              - textbox "Validade (MM/AA)" [ref=e117]:
                - /placeholder: MM/AA
                - text: 12/29
              - group:
                - generic: Validade (MM/AA)
          - generic [ref=e118]:
            - generic [ref=e119]: CVV
            - generic [ref=e120]:
              - textbox "CVV" [ref=e121]: "123"
              - group:
                - generic: CVV
          - generic [ref=e122]:
            - generic [ref=e123]: Parcelas
            - generic [ref=e124]:
              - spinbutton "Parcelas" [ref=e125]: "2"
              - group:
                - generic: Parcelas
        - generic [ref=e126]:
          - generic [ref=e127]: Bandeiras aceitas
          - generic [ref=e128]:
            - generic "VISA" [ref=e129]:
              - img "Bandeira VISA" [ref=e130]
            - generic "MASTERCARD" [ref=e131]:
              - img "Bandeira MASTERCARD" [ref=e132]
            - generic "ELO" [ref=e133]:
              - img "Bandeira ELO" [ref=e134]
            - generic "AMEX" [ref=e135]:
              - img "Bandeira AMEX" [ref=e136]
            - generic "HIPERCARD" [ref=e137]:
              - img "Bandeira HIPERCARD" [ref=e138]
            - generic "HIPER" [ref=e139]:
              - img "Bandeira HIPER" [ref=e140]
            - generic "CABAL" [ref=e141]:
              - generic [ref=e142]: CABAL
            - generic "VERDECARD" [ref=e143]:
              - generic [ref=e144]: VERDECARD
            - generic "UNIONPAY" [ref=e145]:
              - img "Bandeira UNIONPAY" [ref=e146]
            - generic "DINERS" [ref=e147]:
              - img "Bandeira DINERS" [ref=e148]
      - separator [ref=e149]
      - button "Pagar agora" [ref=e150] [cursor=pointer]
    - generic [ref=e151]:
      - generic [ref=e152]:
        - img [ref=e153]
        - paragraph [ref=e155]: Pagamento seguro
      - heading "Resumo do Pedido" [level=6] [ref=e156]
      - generic [ref=e157]:
        - generic [ref=e158]:
          - paragraph [ref=e159]: Pedido
          - paragraph [ref=e160]: "#9001"
        - generic [ref=e161]:
          - paragraph [ref=e162]: Valor
          - paragraph [ref=e163]: R$ 50.99
  - generic [ref=e164]:
    - paragraph [ref=e166] [cursor=pointer]: Voltar ao início
    - generic [ref=e167]:
      - generic [ref=e169]:
        - generic [ref=e170]:
          - heading "Conheça-nos" [level=6] [ref=e171]
          - link "Sobre a Amazon" [ref=e172]:
            - /url: https://www.aboutamazon.com.br/
          - link "Informações corporativas" [ref=e173]:
            - /url: https://www.aboutamazon.com.br/
          - link "Carreiras" [ref=e174]:
            - /url: https://www.amazon.jobs/pt-br/
          - link "Comunicados à imprensa" [ref=e175]:
            - /url: https://www.aboutamazon.com.br/noticias
          - link "Comunidade" [ref=e176]:
            - /url: https://www.aboutamazon.com.br/impacto
          - link "Acessibilidade" [ref=e177]:
            - /url: https://www.amazon.com.br/b?node=21216503011
          - link "Amazon Science" [ref=e178]:
            - /url: https://www.amazon.science/
        - generic [ref=e179]:
          - heading "Ganhe dinheiro conosco" [level=6] [ref=e180]
          - link "Venda na Amazon" [ref=e181]:
            - /url: https://venda.amazon.com.br/
          - link "Proteja e construa a sua marca" [ref=e182]:
            - /url: https://brandservices.amazon.com.br/
          - link "Forneça para a Amazon" [ref=e183]:
            - /url: https://venda.amazon.com.br/
          - link "Publique seus livros" [ref=e184]:
            - /url: https://kdp.amazon.com/pt_BR/
          - link "Seja um associado" [ref=e185]:
            - /url: https://associados.amazon.com.br/
          - link "Anuncie seus produtos" [ref=e186]:
            - /url: https://ads.amazon.com/pt-br
        - generic [ref=e187]:
          - heading "Pagamento" [level=6] [ref=e188]
          - link "Meios de Pagamento" [ref=e189]:
            - /url: https://www.amazon.com.br/b?node=17387340011
          - link "Compre com Pontos" [ref=e190]:
            - /url: https://www.amazon.com.br/b?node=21325178011
          - link "Cartão de crédito Amazon" [ref=e191]:
            - /url: https://www.amazon.com.br/b?node=17387340011
        - generic [ref=e192]:
          - heading "Deixe-nos ajudar você" [level=6] [ref=e193]
          - link "Sua conta" [ref=e194]:
            - /url: https://www.amazon.com.br/gp/css/homepage.html
          - link "Frete e prazo de entrega" [ref=e195]:
            - /url: https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201910060
          - link "Devoluções e reembolsos" [ref=e196]:
            - /url: https://www.amazon.com.br/gp/css/returns/homepage.html
          - link "Gerencie seu conteúdo e dispositivos" [ref=e197]:
            - /url: https://www.amazon.com.br/hz/mycd/myx
          - link "Recalls e alertas de segurança do produto" [ref=e198]:
            - /url: https://www.amazon.com.br/Recalls-e-Alertas-de-Seguran%C3%A7a/b?node=33189917011
          - link "Ajuda" [ref=e199]:
            - /url: https://www.amazon.com.br/gp/help/customer/display.html
      - generic [ref=e200]:
        - img "Amazon Logo" [ref=e201]
        - generic [ref=e202] [cursor=pointer]:
          - generic [ref=e203]: 🇧🇷
          - paragraph [ref=e204]: Brasil
    - generic [ref=e205]:
      - generic [ref=e206]:
        - link "Condições de Uso" [ref=e207]:
          - /url: https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201002280
        - link "Notificação de Privacidade" [ref=e208]:
          - /url: https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201006660
        - link "Cookies" [ref=e209]:
          - /url: https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201890250
        - link "Anúncios Baseados em Interesses" [ref=e210]:
          - /url: https://www.amazon.com.br/gp/help/customer/display.html?nodeId=201890280
      - paragraph [ref=e211]: © 2021-2026 Amazon.com, Inc. ou suas afiliadas
      - paragraph [ref=e212]: Amazon Serviços de Varejo do Brasil Ltda. | CNPJ 15.436.940/0001-03
      - paragraph [ref=e213]:
        - text: "Av. Juscelino Kubitschek, 2041, Torre E, 18º andar - São Paulo CEP: 04543-011 |"
        - link "Fale conosco" [ref=e214]:
          - /url: https://www.amazon.com.br/gp/help/customer/contact-us
        - text: "| ajuda-amazon@amazon.com.br"
      - paragraph [ref=e215]: "Formas de pagamento aceitas: cartões de crédito (Visa, MasterCard, Elo e American Express), cartões de débito (Visa e Elo), Boleto e Pix."
```

# Test source

```ts
  6   | 
  7   | const readinessSelectorByPage: Record<PageName, string[]> = {
  8   |   catalog: ['catalog-header-wrapper'],
  9   |   productDetails: ['product-details-actions-wrapper'],
  10  |   cart: ['cart-content-wrapper', 'text=Seu carrinho está vazio', 'text=Your cart is empty'],
  11  |   login: ['login-form-body'],
  12  |   register: ['register-form-body'],
  13  |   thankYou: ['thank-you-summary-wrapper', 'text=Obrigado pela sua compra!', 'text=Thank you for your purchase!'],
  14  | };
  15  | 
  16  | export async function waitForPageLoad(page: Page, pageName: PageName): Promise<void> {
  17  |   const selectors = readinessSelectorByPage[pageName];
  18  | 
  19  |   let lastError: unknown;
  20  |   for (const selector of selectors) {
  21  |     try {
  22  |       const locator = selector.startsWith('text=')
  23  |         ? page.locator(selector).first()
  24  |         : page.getByTestId(selector).first();
  25  |       await locator.waitFor({ state: 'visible', timeout: 45_000 });
  26  |       return;
  27  |     } catch (err) {
  28  |       lastError = err;
  29  |     }
  30  |   }
  31  | 
  32  |   throw lastError;
  33  | }
  34  | 
  35  | export class PageBase {
  36  |   generateUserData() {
  37  |     return {
  38  |       firstName: faker.person.firstName(),
  39  |       lastName: faker.person.lastName(),
  40  |       email: faker.internet.email().toLowerCase(),
  41  |       password: faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Aa1@',
  42  |     };
  43  |   }
  44  |   protected page: Page;
  45  |   timeOut = 45_000;
  46  | 
  47  |   constructor(page: Page) {
  48  |     this.page = page;
  49  |   }
  50  | 
  51  |   /**
  52  |    * Generate invalid email (no @ symbol)
  53  |    */
  54  |   generateInvalidEmail() {
  55  |     return faker.lorem.word() + faker.lorem.word() + '.com';
  56  |   }
  57  | 
  58  |   /**
  59  |    * Generate password shorter than 8 chars (fails local validation)
  60  |    */
  61  |   generateShortPassword() {
  62  |     return faker.string.alphanumeric(5);
  63  |   }
  64  | 
  65  |   /**
  66  |    * Generate different password for mismatch test
  67  |    */
  68  |   generateDifferentPassword() {
  69  |     return faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Bb2@';
  70  |   }
  71  | 
  72  |   /**
  73  |    * Gera um CPF válido com dígitos verificadores corretos
  74  |    */
  75  |   generateValidCPF(): string {
  76  |     const randomNumbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  77  | 
  78  |     // Calcula primeiro dígito verificador
  79  |     let sum = randomNumbers.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  80  |     let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  81  | 
  82  |     // Calcula segundo dígito verificador
  83  |     const numbersWithFirst = [...randomNumbers, firstDigit];
  84  |     sum = numbersWithFirst.reduce((acc, digit, i) => acc + digit * (11 - i), 0);
  85  |     let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  86  | 
  87  |     const cpfArray = [...randomNumbers, firstDigit, secondDigit];
  88  |     return `${cpfArray.slice(0, 3).join('')}.${cpfArray.slice(3, 6).join('')}.${cpfArray.slice(6, 9).join('')}-${cpfArray.slice(9).join('')}`;
  89  |   }
  90  | 
  91  |   /**
  92  |    * Navega para uma URL
  93  |    */
  94  |   async goto(url: string) {
  95  |     await this.page.goto(url);
  96  |   }
  97  | 
  98  |   /**
  99  |    * Preenche um campo de texto
  100 |    */
  101 |   async fill(selector: string, text: string) {
  102 |     const locator = selector.startsWith('#') || selector.startsWith('.') || selector.startsWith('[') || selector.startsWith('text=') || selector.includes(':') || selector.includes('>')
  103 |       ? this.page.locator(selector).first()
  104 |       : this.page.getByTestId(selector).first();
  105 |     await locator.waitFor({ state: 'visible', timeout: this.timeOut });
> 106 |     await locator.click();
      |                   ^ Error: locator.click: Test timeout of 50000ms exceeded.
  107 |     await locator.fill(text);
  108 |   }
  109 | 
  110 |   /**
  111 |    * Clica em um elemento
  112 |    */
  113 |   async click(selector: string) {
  114 |     const locator = selector.startsWith('#') || selector.startsWith('.') || selector.startsWith('[') || selector.startsWith('text=') || selector.includes(':') || selector.includes('>')
  115 |       ? this.page.locator(selector).first()
  116 |       : this.page.getByTestId(selector).first();
  117 |     await locator.waitFor({ state: 'visible', timeout: this.timeOut });
  118 |     await locator.scrollIntoViewIfNeeded();
  119 |     await locator.focus();
  120 |     await locator.click();
  121 |   }
  122 | 
  123 |   /**
  124 |    * Aguarda para que a página carregue completamente
  125 |    */
  126 |   async waitForLoad(context: string) {
  127 |     // Aguarda elementos específicos de contexto
  128 |     const selectors: { [key: string]: string } = {
  129 |       register: 'register-first-name',
  130 |       catalog: '.product-card',
  131 |       cart: '.cart-item',
  132 |       checkout: '#checkout-button',
  133 |     };
  134 | 
  135 |     const selector = selectors[context];
  136 |     if (selector) {
  137 |       const locator = selector.startsWith('#') || selector.startsWith('.') || selector.startsWith('text=')
  138 |         ? this.page.locator(selector).first()
  139 |         : this.page.getByTestId(selector).first();
  140 |       await locator.waitFor({ state: 'visible', timeout: this.timeOut });
  141 |     }
  142 |   }
  143 | 
  144 | }
  145 | 
```