const TIMEOUTS = Object.freeze({
  short: 15_000,
  default: 25_000,
  long: 30_000,
  extraLong: 40_000,
});

function hasValidCredentials() {
  return Boolean(process.env.E2E_LOGIN_EMAIL && process.env.E2E_LOGIN_PASSWORD);
}

function getLoginCredentials() {
  return {
    email: process.env.E2E_LOGIN_EMAIL,
    password: process.env.E2E_LOGIN_PASSWORD,
  };
}

module.exports = {
  TIMEOUTS,
  hasValidCredentials,
  getLoginCredentials,
};
