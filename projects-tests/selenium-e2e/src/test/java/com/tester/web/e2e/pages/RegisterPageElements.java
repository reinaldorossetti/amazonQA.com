package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class RegisterPageElements extends BasePage {

  protected static final By FORM_BODY = By.id("register-form-body");
  protected static final By FIRST_NAME = By.id("register-first-name");
  protected static final By LAST_NAME = By.id("register-last-name");
  protected static final By CPF = By.id("register-cpf");
  protected static final By EMAIL = By.id("register-email");
  protected static final By PHONE = By.id("register-phone");
  protected static final By PASSWORD = By.id("register-password");
  protected static final By CONFIRM_PASSWORD = By.id("register-confirm-password");
  protected static final By NEXT_BUTTON = By.id("register-next-btn");
  protected static final By SUBMIT_BUTTON = By.id("register-submit-btn");
  protected static final By ZIP_CODE = By.id("register-address-zip");
  protected static final By STREET = By.id("register-address-street");
  protected static final By NUMBER = By.id("register-address-number");

  protected RegisterPageElements(WebDriver driver) {
    super(driver);
  }
}
