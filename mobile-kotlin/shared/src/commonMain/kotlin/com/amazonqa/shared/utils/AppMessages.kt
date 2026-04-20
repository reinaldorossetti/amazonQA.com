package com.amazonqa.shared.utils

data class AppMessages(
    val thankYouTitle: String = "Obrigado pela sua compra!",
    val orderProcessed: String = "Seu pedido foi processado e já estamos preparando para envio.",
    val orderConfirmationEmail: String = "Você receberá uma confirmação por e-mail em breve.",
    val pixGenerated: String = "QR Code PIX gerado",
    val pixMockInfo: String = "Este QR Code PIX é mockado para testes e não realiza cobrança real.",
    val pixCopyBtn: String = "Copiar código PIX",
    val orderSummary: String = "Resumo do Pedido",
    val productColumn: String = "Produto",
    val quantityColumn: String = "Qtd",
    val totalColumn: String = "Total",
    val boletoGenerated: String = "Boleto gerado",
    val boletoMockInfo: String = "Este boleto é mockado para testes e não possui validade bancária real.",
    val boletoCopyBtn: String = "Copiar linha",
    val boletoDownloadBtn: String = "Baixar boleto",
    val backToCatalog: String = "Voltar ao Catálogo",
    val loginEmail: String = "E-mail ou Telefone",
    val loginPassword: String = "Senha",
    val loginContinue: String = "Continuar",
    val loginRegister: String = "Não tem conta? Comece aqui.",
    val loginSkip: String = "Entrar como visitante",
    val registerTitle: String = "Criar conta",
    val paymentTitle: String = "Pagamento",
    val orderTotalLabel: String = "Total do Pedido",
    val paymentMethodSelection: String = "Selecione o método de pagamento:"
)

data class AppErrorMessages(
    val loginRequired: String = "Você precisa estar logado para confirmar o pedido. Por favor, faça login em sua conta.",
    val orderLoadError: String = "Não foi possível carregar os pedidos.",
    val connectionError: String = "Não foi possível conectar ao servidor. Verifique se o serviço de backend está no ar.",
    val hostError: String = "Sem conexão com a internet ou servidor inacessível.",
    val catalogLoadError: String = "Ops! Ocorreu um problema ao carregar os produtos. Tente novamente mais tarde.",
    val authBackendOffline: String = "Erro de conexão: servidor do backend offline.",
    val authInvalidCredentials: String = "E-mail ou senha incorretos.",
    val authGenericError: String = "Não foi possível entrar. Verifique sua conexão.",
    val registerEmailConflict: String = "Este e-mail já está cadastrado.",
    val registerGenericError: String = "Erro ao criar conta. Tente novamente."
)

val AppStrings = AppMessages()
val AppErrors = AppErrorMessages()
