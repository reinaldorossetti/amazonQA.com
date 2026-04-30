/**
 * Base helpers for Detox page objects
 */
class BasePage {
  TIMEOUT_DEFAULT = 35000;
  async swipeUntilVisible(matcher, timeout = 5000, scrollAmount = 200) {
    // Try a plain wait first
    try {
      await waitFor(element(matcher)).toBeVisible().withTimeout(timeout);
      return;
    } catch (e) {
      // continue to try scrolling
    }

    const containers = [
      by.type('androidx.recyclerview.widget.RecyclerView'),
      by.type('android.widget.ScrollView'),
      by.type('androidx.core.widget.NestedScrollView'),
      by.type('android.widget.ListView'),
      by.id('android:id/content')
    ];

    for (const container of containers) {
      try {
        await waitFor(element(matcher))
          .toBeVisible()
          .whileElement(element(container))
          .scroll(scrollAmount, 'down')
          .withTimeout(timeout);
        return;
      } catch (err) {
        // try next container
      }
    }

    // Last attempt without scrolling to throw the original error
    await waitFor(element(matcher)).toBeVisible().withTimeout(timeout);
  }

  async waitForId(id, timeout = 5000) {
    await this.swipeUntilVisible(by.id(id), timeout);
  }

  async waitForText(text, timeout = 5000) {
    await this.swipeUntilVisible(by.text(text), timeout);
  }
}

module.exports = new BasePage();
