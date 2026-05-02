/**
 * Detox configuration for projects-tests/detox-mobile
 * - APKs vivem em ./app/apk/ (gerados por `npm run android:build` + copy)
 * - Opcional: `npm run android:install` instala no dispositivo antes dos testes
 * - `reinstallApp: true` faz o Detox reinstalar app + test APK ao iniciar (alinhado ao package.json)
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
      binaryPath: './app/apk/androidApp-debug.apk',
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
      // Detox instala/atualiza APKs a partir de binaryPath / testBinaryPath no init
      build: 'echo "APK paths set; use android:build or let Detox reinstall"'
    },
    // Provide a release-oriented configuration that also skips the build step
    // so that invoking `detox build --configuration android.emu.release` will
    // not trigger a heavy Gradle build in local/debug flows.
    'android.emu.release': {
      device: 'attached',
      app: 'android.debug',
      build: 'echo "APK paths set; use android:build or let Detox reinstall"'
    }
  },

  behavior: {
    init: {
      // Reinstalar a partir de binaryPath / testBinaryPath (requer emulador + adb)
      reinstallApp: true,
      // Keep Detox globals exposed to match current tests
      exposeGlobals: true
    },
    // Let Detox start the instrumentation automatically
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
