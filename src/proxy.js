const httpProxy = require('http-proxy')
const http = require("http")
const {tokens} = require("./config")
const url = require('url')
const targetHost = 'localhost'
const targetHttpPort = 8545
const targetWsPort = 8546
const proxyPort = 3000

// HERE LIES: A reverse proxy server for many ethereum blockchain backends
// - Requires valid web3 HTTP and WebSocket endpoints on target server
// - Proxy listens on port 3000, assumes
// - Proxies http requests to port 8545 of target, ws connections to port 8646 on target
// - Authenticates based on presence of whitelisted tokens (which are sha256 hashes)

// main function
const run = () => {
  const proxy = createProxy()
  const server = handleWsRequests(createServer(proxy), proxy)
  server.listen(proxyPort)

  console.log(`Listening on HTTPS port ${proxyPort}`)
  return server
}

const createProxy = () => {
  const proxy = httpProxy.createProxyServer({})
  proxy.on("error", (err, req, res) => {
    const [code, msg] = err.code === 'ECONNREFUSED'
      ? [503, 'service unavailable']
      : [500, "server error"]
    respondWithError(res, code, msg)
  })
  return proxy
}

const createServer = proxy => (
  http.createServer((req, res) => {
    hasValidToken(req)
      ? proxy.web(req, res, { target: `http://${targetHost}:${targetHttpPort}` })
      : respondWithError(res, 401, "access denied")
  })
)

const handleWsRequests = (server, proxy) => {
  server.on("upgrade", (req, socket, head) => {
    hasValidToken(req)
    ? proxy.ws(req, socket, head, { target: `ws://${targetHost}:${targetWsPort}` })
    : socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n")
  })
  return server
}

const hasValidToken = (req)  =>
  tokens[url.parse(req.url, true).query['token']]

const respondWithError = (res, code, msg) => {
  res.writeHead(code, {'Content-Type': 'application/json' })
  res.write(JSON.stringify({ error: msg }))
  res.end()
}

module.exports = {
  run,
  targetHost,
  targetHttpPort,
  targetWsPort,
  proxyPort,
}
