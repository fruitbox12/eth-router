const defaults = {
  targetHost:      "localhost",
  proxyPort:       3000,
  ropstenHttpPort: 8545,
  ropstenWsPort:   8546,
}

module.exports = {
  development: defaults,
  production: defaults,
  test: defaults,
}

