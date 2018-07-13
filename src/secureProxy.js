const {tokens} = require("./config")

// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

const httpProxy = require('http-proxy'),
      url = require('url'),
      fs = require('fs'),
      targetHttpPort = 8545,
      targetWsPort = 8546,
      proxyPort = 3000;

const run = () => {
  const server = handleProxyRequests(initialize())
  server.listen(proxyPort);
  console.log(`Listening on HTTPS port ${proxyPort}`);
  return server
}

const initialize = () => {
  // web3 support for SSL not supported for self-signed certs; cURL is. See README for details.
  return httpProxy.createServer({
    target: `http://localhost:${targetHttpPort}`,

    // TODO: (aguestuser|04 Jul 2018)
    // restore this once local CA enables passing tests
    // see: https://stackoverflow.com/questions/19665863/how-do-i-use-a-self-signed-certificate-for-a-https-node-js-server/24749608#24749608

    // ssl: {
    //   key: fs.readFileSync('ssl/key.pem', 'utf8'),
    //   cert: fs.readFileSync('ssl/cert.pem', 'utf8')
    // }
  })
}

const handleProxyRequests = server => {
  // 'proxyReq' event is called after TLS handshake and before passing the request to the backend.
  server.on('proxyReq', function(proxyReq, req, res, options) {
    authenticate(req, res)
    // curious: does ordering matter here?
    handleWsUpgrade(server)
  });
  return server
}

const authenticate = (req, res)  => {
  const query = url.parse(req.url, true).query

  if (!tokens[query['token']]) {
    res.writeHead(401, {'Content-Type': 'application/json' })
    res.write(JSON.stringify({ error: "access denied" }))
    res.end()
  }
}

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
