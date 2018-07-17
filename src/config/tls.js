const base = {
  keyPath: 'certs/server/privkey.pem',
  certPath: 'certs/server/fullchain.pem'
}

module.exports = {
  development: base,
  test: base,
  production: {
    //TODO: specify these env vars in ansible `ethrouter` role (@lee: help?)
    keyPath: process.env.TLS_KEY_PATH,
    certPath: process.env.TLS_CERT_PATH,
  }
}
