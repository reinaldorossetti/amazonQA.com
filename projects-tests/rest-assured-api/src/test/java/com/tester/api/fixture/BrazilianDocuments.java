package com.tester.api.fixture;

import java.util.concurrent.ThreadLocalRandom;

public final class BrazilianDocuments {

  private BrazilianDocuments() {}

  public static String validCpf() {
    int[] digits = new int[9];
    for (int i = 0; i < 9; i++) {
      digits[i] = ThreadLocalRandom.current().nextInt(10);
    }
    int first = checkDigit(digits, 10);
    int[] withFirst = append(digits, first);
    int second = checkDigit(withFirst, 11);
    int[] full = append(withFirst, second);
    return formatCpf(full);
  }

  public static String validCnpj() {
    int[] digits = new int[12];
    for (int i = 0; i < 12; i++) {
      digits[i] = ThreadLocalRandom.current().nextInt(10);
    }
    int[] weightsFirst = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    int[] weightsSecond = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    int first = checkDigitWeighted(digits, weightsFirst);
    int[] withFirst = append(digits, first);
    int second = checkDigitWeighted(withFirst, weightsSecond);
    int[] full = append(withFirst, second);
    return formatCnpj(full);
  }

  private static int checkDigit(int[] numbers, int factorStart) {
    int sum = 0;
    for (int i = 0; i < numbers.length; i++) {
      sum += numbers[i] * (factorStart - i);
    }
    int mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  }

  private static int checkDigitWeighted(int[] numbers, int[] weights) {
    int sum = 0;
    for (int i = 0; i < numbers.length; i++) {
      sum += numbers[i] * weights[i];
    }
    int mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  }

  private static int[] append(int[] source, int value) {
    int[] result = new int[source.length + 1];
    System.arraycopy(source, 0, result, 0, source.length);
    result[source.length] = value;
    return result;
  }

  private static String formatCpf(int[] digits) {
    return String.format(
        "%d%d%d.%d%d%d.%d%d%d-%d%d",
        digits[0], digits[1], digits[2],
        digits[3], digits[4], digits[5],
        digits[6], digits[7], digits[8],
        digits[9], digits[10]);
  }

  private static String formatCnpj(int[] digits) {
    return digits[0]
        + String.valueOf(digits[1])
        + "."
        + digits[2]
        + digits[3]
        + digits[4]
        + "."
        + digits[5]
        + digits[6]
        + digits[7]
        + "/"
        + digits[8]
        + digits[9]
        + digits[10]
        + digits[11]
        + "-"
        + digits[12]
        + digits[13];
  }
}
