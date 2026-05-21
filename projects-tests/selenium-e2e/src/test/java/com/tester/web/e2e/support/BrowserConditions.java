package com.tester.web.e2e.support;

import com.tester.web.e2e.config.BrowserName;

public final class BrowserConditions {

  private BrowserConditions() {}

  public static boolean isChromium() {
    BrowserName browser = BrowserName.current();
    return BrowserName.CHROME.equals(browser) || BrowserName.EDGE.equals(browser);
  }
}
