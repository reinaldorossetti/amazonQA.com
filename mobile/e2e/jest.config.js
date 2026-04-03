module.exports = {
  testEnvironment: 'detox/runners/jest/testEnvironment',
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testTimeout: 180000,
  maxWorkers: 1,
  testMatch: ['**/*.e2e.ts'],
};
