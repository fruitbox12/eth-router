const defaults = {
  targetHost:      "localhost",
  proxyPort:       3000,
  ropstenHttpPort: 8545,
  ropstenWsPort:   8546,
  mainnetWsPort:   8548,
}

module.exports = {
  development: defaults,
  production: defaults,
  test: defaults,
}

