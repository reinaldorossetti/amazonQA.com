/**
 * Detox configuration for projects-tests/detox-mobile
 * - Assumes APKs are already built and installed on the device/emulator
 * - Skips the build step to "aproveitar a sessão" (reuse installed app)
 * - Disables automatic reinstall to speed up local/debug runs
 * - Leaves launchApp behaviour manual so specs can decide whether to start a new instance
 */
module.exports = {
  testRunner: {
    jest: {
      // Increase environment setup timeout (ms) - matches package.json jest timeout
      setupTimeout: 600000
    }
  },

  apps: {
    'android.debug': {
      type: 'android.apk',
      // Path to the app APK (relative to this file)
      binaryPath: './app/apk/androidApp-debug-androidTest.apk',
      // Path to the instrumentation (androidTest) APK
      testBinaryPath: './app/apk/androidApp-debug-androidTest.apk',
      // Explicit package names help when the APKs are already installed
      package: 'com.amazonqa.android',
      // instrumentation/test package should point to the test APK's package
      testPackage: 'com.amazonqa.android.test'
    }
  },

  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_8a'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: 'emulator-5554'
      }
    }
  },

  configurations: {
    'android.emu.debug': {
      device: 'attached',
      app: 'android.debug',
      // Skip build step because the APKs are assumed to be already installed
      build: 'echo "APK already installed, skipping build"'
    }
    ,
    // Provide a release-oriented configuration that also skips the build step
    // so that invoking `detox build --configuration android.emu.release` will
    // not trigger a heavy Gradle build in local/debug flows.
    'android.emu.release': {
      device: 'attached',
      app: 'android.debug',
      build: 'echo "APK already installed, skipping build"'
    }
  },

  behavior: {
    init: {
      // Do not uninstall/reinstall the app on init - reuse installed APK
      reinstallApp: false,
      // Keep Detox globals exposed to match current tests
      exposeGlobals: true
    },
    // Let Detox start the instrumentation automatically (but it won't reinstall the app)
    launchApp: 'auto',
    cleanup: {
      // Do not shut down the emulator/device after tests so the session can be reused
      shutdownDevice: false
    }
  },

  artifacts: {
    rootDir: 'artifacts',
    plugins: {
      log: 'failing',
      screenshot: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: true
      },
      // Record video only for failing tests to save space/time
      video: 'failing'
    }
  },

  logger: {
    level: 'info',
    overrideConsole: true
  }
};
