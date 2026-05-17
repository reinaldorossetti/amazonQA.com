package com.tester.web.e2e.support;

public enum PaymentMethod {
  CREDIT("Crédito", "Pagar agora", "Forma de pagamento: Crédito"),
  DEBIT("Débito", "Pagar agora", "Forma de pagamento: Débito"),
  PIX("PIX", "Gerar QR Code", "Forma de pagamento: PIX"),
  BOLETO("Boleto", "Gerar boleto", "Forma de pagamento: Boleto");

  private final String displayName;
  private final String submitButtonText;
  private final String confirmationText;

  PaymentMethod(String displayName, String submitButtonText, String confirmationText) {
    this.displayName = displayName;
    this.submitButtonText = submitButtonText;
    this.confirmationText = confirmationText;
  }

  public String displayName() {
    return displayName;
  }

  public String submitButtonText() {
    return submitButtonText;
  }

  public String confirmationText() {
    return confirmationText;
  }

  @Override
  public String toString() {
    return displayName;
  }
}
