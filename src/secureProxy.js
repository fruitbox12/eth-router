// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

const http = require('http'),
      httpProxy = require('http-proxy'),
      url = require('url'),
      fs = require('fs'),
      querystring = require('querystring'),
      tokenRecord = 'foo',
      targetHttpPort = 8545,
      targetWsPort = 8546,
      proxyPort = 3000;

const run = () => {
  const server = handleProxyRequests(initialize())
  server.listen(proxyPort);
  console.log(`Listening on HTTPS port ${proxyPort}`);
}

const initialize = () => {
  // web3 support for SSL not supported for self-signed certs; cURL is. See README for details.
  return httpProxy.createServer({
    target: `http://localhost:${targetHttpPort}`,
    ssl: {
      key: fs.readFileSync('ssl/key.pem', 'utf8'),
      cert: fs.readFileSync('ssl/cert.pem', 'utf8')
    }
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
  console.log(`Received request with token: ${query['token']}`)
  if (query['token'] !== tokenRecord) {
    res.write('access denied')
    res.end()
  }
}

const handleWsUpgrade = server => {
  server.on('upgrade', (req, socket, head) => {
    const proxy = httpProxy.createProxyServer({ ws: true })
    console.log("Got WSS upgrade connection");
    proxy.ws(req, socket, head, { target: `ws://localhost:${targetWsPort}` })
  })
}

module.exports = { run }
