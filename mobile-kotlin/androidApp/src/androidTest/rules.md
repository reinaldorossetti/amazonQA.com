
Project Structure
To ensure that the project is scalable and easy to maintain, I adopted a modular structure, organizing tests into specific folders. Here’s an example of how the project is structured:

src
 └── androidTest
      ├── features
      │    └── auth      // Test Steps use AAA (Arrange, Act, Assert) pattern
      ├── screens
      │    └── MainActivityE2ETests.kt   // Functions that cover the entire flow of feature, from login to specific features.
      ├── helpers
      │    └── EspressoPageHelper.kt    // Global helper functions for UI interactions, like clicking, typing, and verifying elements.

helpers/: Contains utility classes, like the Robot Pattern, which encapsulate UI interactions.
cases/: Contains E2E test cases that cover different flows of the app.
screens/: Focuses on UI tests for each specific screen or activity.

Best Practices for UI Testing
- Isolated Tests: Each test should cover a specific scenario. Avoid having one test depend on another.
- Separation of Concerns: Use the screen classes to avoid code duplication and centralize UI interaction logic.
- Modular Structure: By organizing your tests into specific folders (like helpers/, features/, screens/), you keep the project clean and easy to navigate, especially as it grows.
- Test Performance: E2E tests can be slower than unit tests, so be selective about which flows should be covered by these tests.


Sample Test Case, following the AAA ou ATTD Pattern for UI interactions:
```
@Test
fun testOnInvestmentAndWalletScreen() {
    // Verify that MXRF11 is visible on the Earnings tab
    auth.clickOnEarningsTab()
    auth.verifyInvestmentCardIsDisplayed("MXRF11")
    
    // Switch to the Wallet tab and verify the entry
    auth.clickOnWalletTab()
    auth.verifyWalletEntryIsDisplayed("MXRF11")
}
```