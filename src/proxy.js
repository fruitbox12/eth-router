const {tokens} = require("./config")

// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint on target server

const httpProxy = require('http-proxy'),
      url = require('url'),
      fs = require('fs'),
      tlsConfig = require('./config').tls
      targetHttpPort = 8545,
      targetWsPort = 8546,
      proxyPort = 3000;

const {keyPath, certPath} = tlsConfig

const run = () => {
  const server = handleProxyRequests(initialize())
  server.listen(proxyPort);
  console.log(`Listening on HTTPS port ${proxyPort}`);
  return server
}

const initialize = () => {
  return httpProxy.createServer({
    target: `http://localhost:${targetHttpPort}`,
    ssl: {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    }
  })
}

const handleProxyRequests = server => {
  // 'proxyReq' event called after TLS handshake, before passing request to server
  server.on('proxyReq', function(proxyReq, req, res, options) {
    authenticate(req, res) // TODO: does ordering matter here?
    handleWsUpgrade(server)
  });
  return server
}

const authenticate = (req, res)  => {
  if (!tokens[parseToken(req)]) {
    res.writeHead(401, {'Content-Type': 'application/json' })
    res.write(JSON.stringify({ error: "access denied" }))
    res.end()
  }
}

const parseToken = (req) =>
  url.parse(req.url, true).query['token']

const handleWsUpgrade = server => {
  server.on('upgrade', (req, socket, head) => {
    console.log("Got WSS upgrade connection");
    httpProxy
      .createProxyServer({ ws: true })
      .ws(req, socket, head, {
        target: `ws://localhost:${targetWsPort}`
      })
  })
}

module.exports = {
  run,
  targetHttpPort,
  targetWsPort,
  proxyPort,
}
