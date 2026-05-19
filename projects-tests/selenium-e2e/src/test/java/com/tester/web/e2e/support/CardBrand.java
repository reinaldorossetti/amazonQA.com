package com.tester.web.e2e.support;

public enum CardBrand {
  VISA("visa", "4111111111111111"),
  MASTERCARD("mastercard", "5555555555554444"),
  ELO("elo", "6362970000457013"),
  AMEX("amex", "378282246310005"),
  HIPERCARD("hipercard", "6062825624254001"),
  HIPER("hiper", "6370950000000000"),
  CABAL("cabal", "6376010000000000"),
  VERDECARD("verdecard", "5899000000000000"),
  UNIONPAY("unionpay", "6240008631401148"),
  DINERS("diners", "30569309025904");

  private final String id;
  private final String cardNumber;

  CardBrand(String id, String cardNumber) {
    this.id = id;
    this.cardNumber = cardNumber;
  }

  public String id() {
    return id;
  }

  public String cardNumber() {
    return cardNumber;
  }

  @Override
  public String toString() {
    return id;
  }
}
