import React, { createContext, useState, useContext, useEffect } from "react";

const translations = {
  pt: {
    // NavBar
    "nav.logo": "tester<Box id=\"nav-logo-span\" component=\"span\" sx={{ color: \"#ff9900\", fontSize: \"1.2rem\", ml: \"1px\" }}>.com</Box>",
    "nav.browse": "Navegue pelo",
    "nav.catalog": "Catálogo",
    "nav.all": "Todos ▾",
    "nav.search_placeholder": "Pesquisa tester.com",
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
    "nav.logo": "tester<Box id=\"nav-logo-span\" component=\"span\" sx={{ color: \"#ff9900\", fontSize: \"1.2rem\", ml: \"1px\" }}>.com</Box>",
    "nav.browse": "Browse",
    "nav.catalog": "Catalog",
    "nav.all": "All ▾",
    "nav.search_placeholder": "Search tester.com",
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

  const toggleLanguage = () => {
    setLanguage((prevLang) => {
      const newLang = prevLang === "pt" ? "en" : "pt";
      localStorage.setItem("app_language", newLang);
      return newLang;
    });
  };

  const setAppLanguage = (lang) => {
     if(translations[lang]) {
         setLanguage(lang);
         localStorage.setItem("app_language", lang);
     }
  }

  // Helper function to translate keys
  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
