import React, { createContext, useState, useContext, useEffect } from "react";

const translations = {
  pt: {
    // NavBar
    "nav.logo": "amazonQA<Box id=\"nav-logo-span\" component=\"span\" sx={{ color: \"#ff9900\", fontSize: \"1.2rem\", ml: \"1px\" }}>.com</Box>",
    "nav.browse": "Navegue pelo",
    "nav.catalog": "Catálogo",
    "nav.all": "Todos ▾",
    "nav.search_placeholder": "Pesquisa amazonQA.com",
    "nav.cart": "Carrinho",
    "nav.new_customer": "Cliente novo?",
    "nav.start_here": "Comece aqui.",
    "nav.hello": "Olá,",
    "nav.logout_tooltip": "Sair",

    // Catalog
    "catalog.title": "Catálogo de Produtos",
    "catalog.products_found": "{count} produto{plural} encontrado{plural}",
    "catalog.search_placeholder": "Pesquisar produtos...",
    "catalog.all_categories": "Todos",
    "catalog.no_products": "Nenhum produto encontrado.",

    // Product
    "product.add_to_cart": "Adicionar ao Carrinho",
    "product.in_stock": "Em estoque",

    // Cart
    "cart.title": "Meu Carrinho",
    "cart.empty_title": "Seu carrinho está vazio",
    "cart.empty_desc": "Adicione produtos do catálogo para começar.",
    "cart.go_to_catalog": "Ir ao Catálogo",
    "cart.order_summary": "Resumo do Pedido",
    "cart.items": "Itens ({count})",
    "cart.shipping": "Frete",
    "cart.free": "Grátis",
    "cart.total": "Total",
    "cart.continue_shopping": "Continuar comprando",

    // Cart Item
    "cart_item.qty": "Qtd:",
    "cart_item.delete": "Excluir",

    // Checkout Button
    "checkout.button": "Fechar Pedido",
    "checkout.processing": "Processando...",
    "checkout.toast.empty": "O carrinho está vazio.",
    "checkout.toast.error": "Erro no checkout",

    // App (Toast messages)
    "app.toast.qty_updated": "Quantidade atualizada: {name}",
    "app.toast.added": "{name} adicionado ao carrinho!",
    "app.toast.removed": "{name} removido do carrinho.",

    // Thank You
    "thank_you.title": "Obrigado pela sua compra!",
    "thank_you.subtitle": "Seu pedido foi processado e já estamos preparando para envio.",
    "thank_you.summary": "Resumo do Pedido",
    "thank_you.product": "Produto",
    "thank_you.qty": "Qtd",
    "thank_you.unit_price": "Preço Un.",
    "thank_you.table_total": "Total",
    "thank_you.total": "Total: R$ {total}",
    "thank_you.back": "Voltar ao Catálogo",
    "thank_you.boleto.title": "Boleto gerado",
    "thank_you.boleto.mock_notice": "Este boleto é mockado para testes e não possui validade bancária real.",
    "thank_you.boleto.beneficiary": "Beneficiário",
    "thank_you.boleto.cnpj": "CNPJ",
    "thank_you.boleto.due_date": "Vencimento",
    "thank_you.boleto.line": "Linha digitável",
    "thank_you.boleto.barcode": "Código de barras",
    "thank_you.boleto.copy": "Copiar linha",
    "thank_you.boleto.download": "Baixar boleto",
    "thank_you.pix.title": "QR Code PIX gerado",
    "thank_you.pix.mock_notice": "Este QR Code PIX é mockado para testes e não realiza cobrança real.",
    "thank_you.pix.code": "Código PIX",
    "thank_you.pix.readable_text": "Valor lido no QR Code",
    "thank_you.pix.expires": "Expira em",
    "thank_you.pix.copy": "Copiar código PIX",

    // Payments
    "payments.title": "Pagamento",
    "payments.subtitle": "Escolha como deseja pagar seu pedido.",
    "payments.method": "Método de pagamento",
    "payments.summary": "Resumo do Pedido",
    "payments.amount": "Valor",
    "payments.split.enable": "Usar 2 métodos de pagamento",
    "payments.split.second_method": "Segundo método",
    "payments.split.first_amount": "Valor do 1º pagamento",
    "payments.split.remaining": "Saldo restante",
    "payments.cta.pay_now": "Pagar agora",
    "payments.cta.generate_pix": "Gerar QR Code",
    "payments.cta.generate_boleto": "Gerar boleto",
    "payments.card.holder": "Nome no cartão",
    "payments.card.number": "Número do cartão",
    "payments.card.expiry": "Validade (MM/AA)",
    "payments.card.cvv": "CVV",
    "payments.card.installments": "Parcelas",
    "payments.pix.info": "Após gerar o PIX, conclua o pagamento no app do seu banco.",
    "payments.boleto.info": "O boleto pode levar até 3 dias úteis para compensação.",
    "payments.secure": "Pagamento seguro",
    "payments.error.no_order": "Pedido não encontrado. Retorne ao carrinho.",
    "payments.error.invalid_split": "Valores inválidos para pagamento combinado.",
    "payments.error.same_method": "Escolha métodos diferentes no pagamento combinado.",
    "payments.success": "Pagamento processado com sucesso!",
    "payments.pending": "Pagamento criado e aguardando confirmação.",

    // Product Details
    "product_details.not_found": "Produto não encontrado.",
    "product_details.back": "Voltar",
    "product_details.details_title": "Detalhes do Produto",
    "product_details.manufacturer": "Fabricante",
    "product_details.line": "Linha",
    "product_details.model": "Modelo",
  },
  en: {
    // NavBar
    "nav.logo": "amazonQA<Box id=\"nav-logo-span\" component=\"span\" sx={{ color: \"#ff9900\", fontSize: \"1.2rem\", ml: \"1px\" }}>.com</Box>",
    "nav.browse": "Browse",
    "nav.catalog": "Catalog",
    "nav.all": "All ▾",
    "nav.search_placeholder": "Search amazonQA.com",
    "nav.cart": "Cart",
    "nav.new_customer": "New here?",
    "nav.start_here": "Start here.",
    "nav.hello": "Hello,",
    "nav.logout_tooltip": "Sign out",

    // Catalog
    "catalog.title": "Product Catalog",
    "catalog.products_found": "{count} product{plural} found",
    "catalog.search_placeholder": "Search products...",
    "catalog.all_categories": "All",
    "catalog.no_products": "No products found.",

    // Product
    "product.add_to_cart": "Add to Cart",
    "product.in_stock": "In Stock",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty_title": "Your cart is empty",
    "cart.empty_desc": "Add products from the catalog to get started.",
    "cart.go_to_catalog": "Go to Catalog",
    "cart.order_summary": "Order Summary",
    "cart.items": "Items ({count})",
    "cart.shipping": "Shipping",
    "cart.free": "Free",
    "cart.total": "Total",
    "cart.continue_shopping": "Continue shopping",

    // Cart Item
    "cart_item.qty": "Qty:",
    "cart_item.delete": "Delete",

    // Checkout Button
    "checkout.button": "Proceed to Checkout",
    "checkout.processing": "Processing...",
    "checkout.toast.empty": "Cart is empty.",
    "checkout.toast.error": "Checkout error",

    // App (Toast messages)
    "app.toast.qty_updated": "Quantity updated: {name}",
    "app.toast.added": "{name} added to cart!",
    "app.toast.removed": "{name} removed from cart.",

    // Thank You
    "thank_you.title": "Thank you for your purchase!",
    "thank_you.subtitle": "Your order has been processed and is being prepared for shipping.",
    "thank_you.summary": "Order Summary",
    "thank_you.product": "Product",
    "thank_you.qty": "Qty",
    "thank_you.unit_price": "Unit Price",
    "thank_you.table_total": "Total",
    "thank_you.total": "Total: ${total}", // changed R$ to $ assuming this might be expected, but let's stick to R$ since formatting might be complex. Actually let's use R$ for parity right now to keep currency formatting simple and not change numbers.
    "thank_you.back": "Back to Catalog",
    "thank_you.boleto.title": "Generated boleto",
    "thank_you.boleto.mock_notice": "This boleto is mocked for tests and has no real bank validity.",
    "thank_you.boleto.beneficiary": "Beneficiary",
    "thank_you.boleto.cnpj": "CNPJ",
    "thank_you.boleto.due_date": "Due date",
    "thank_you.boleto.line": "Digitable line",
    "thank_you.boleto.barcode": "Barcode",
    "thank_you.boleto.copy": "Copy line",
    "thank_you.boleto.download": "Download boleto",
    "thank_you.pix.title": "Generated PIX QR Code",
    "thank_you.pix.mock_notice": "This PIX QR Code is mocked for testing and does not charge real money.",
    "thank_you.pix.code": "PIX code",
    "thank_you.pix.readable_text": "Value read from QR Code",
    "thank_you.pix.expires": "Expires at",
    "thank_you.pix.copy": "Copy PIX code",

    // Payments
    "payments.title": "Payment",
    "payments.subtitle": "Choose how you want to pay for your order.",
    "payments.method": "Payment method",
    "payments.summary": "Order Summary",
    "payments.amount": "Amount",
    "payments.split.enable": "Use 2 payment methods",
    "payments.split.second_method": "Second method",
    "payments.split.first_amount": "First payment amount",
    "payments.split.remaining": "Remaining amount",
    "payments.cta.pay_now": "Pay now",
    "payments.cta.generate_pix": "Generate QR Code",
    "payments.cta.generate_boleto": "Generate boleto",
    "payments.card.holder": "Card holder name",
    "payments.card.number": "Card number",
    "payments.card.expiry": "Expiry (MM/YY)",
    "payments.card.cvv": "CVV",
    "payments.card.installments": "Installments",
    "payments.pix.info": "After generating PIX, complete payment in your banking app.",
    "payments.boleto.info": "Boleto may take up to 3 business days to settle.",
    "payments.secure": "Secure payment",
    "payments.error.no_order": "Order not found. Please return to cart.",
    "payments.error.invalid_split": "Invalid split payment values.",
    "payments.error.same_method": "Choose different methods for split payment.",
    "payments.success": "Payment processed successfully!",
    "payments.pending": "Payment created and awaiting confirmation.",

    // Product Details
    "product_details.not_found": "Product not found.",
    "product_details.back": "Back",
    "product_details.details_title": "Product Details",
    "product_details.manufacturer": "Manufacturer",
    "product_details.line": "Line",
    "product_details.model": "Model",
  }
};

// Fixing thank you total to keep currency consistent for now to prevent bugs, we can localized currency later if requested.
translations.en["thank_you.total"] = "Total: R$ {total}";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("pt");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("app_language");
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  /**
   * Toggles the active language between `'pt'` (Portuguese) and `'en'` (English).
   * The selection is persisted to `localStorage` under the key `'app_language'`.
   *
   * @returns {void}
   */
  const toggleLanguage = () => {
    setLanguage((prevLang) => {
      const newLang = prevLang === "pt" ? "en" : "pt";
      localStorage.setItem("app_language", newLang);
      return newLang;
    });
  };

  /**
   * Sets the application language explicitly.
   * No-op if `lang` is not a supported locale key.
   *
   * @param {'pt'|'en'} lang - The locale to activate.
   * @returns {void}
   */
  const setAppLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("app_language", lang);
    }
  };

  /**
   * Translates a dot-notation key to the active locale string.
   * Supports simple named parameter interpolation via `{paramName}` placeholders.
   * Falls back to the raw key if no translation is found.
   *
   * @param {string}  key    - Translation key (e.g. `'nav.cart'`).
   * @param {Object}  [params={}] - Optional map of placeholder values.
   * @returns {string} The translated (and interpolated) string.
   *
   * @example
   * t('catalog.products_found', { count: 5, plural: 's' })
   * // => '5 produtos encontrados'
   */
  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setAppLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook that returns the current language context value.
 *
 * Must be called from a component rendered inside {@link LanguageProvider}.
 *
 * @returns {{ language: string, toggleLanguage: function, setAppLanguage: function, t: function }}
 * @throws {Error} If called outside a `LanguageProvider` tree.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
