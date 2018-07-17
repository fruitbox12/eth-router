const base = {
  keyPath: 'certs/server/privkey.pem',
  certPath: 'certs/server/fullchain.pem'
}

module.exports = {
  development: base,
  test: base,
  production: {
    keyPath: process.env.TLS_KEY_PATH,
    certPath: process.env.TLS_CERT_PATH,
  }
}
