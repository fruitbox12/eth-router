const httpProxy = require('http-proxy')
const http = require("http")
const url = require('url')
const { tokens, network } = require("./config")
const { proxyPort, targetHost, ropstenHttpPort, ropstenWsPort, mainnetWsPort, mainnetHttpPort } = network

// HERE LIES: A reverse proxy server for many ethereum blockchain backends
// - Requires valid web3 HTTP and WebSocket endpoints on target server
// - Proxy listens on port 3000, assumes
// - Proxies http requests to port 8545 of target, ws connections to port 8646 on target
// - Authenticates based on presence of whitelisted tokens (which are sha256 hashes)

// main function

const ropstenPath = '/'
const mainnetPath = '/mainnet'

const run = () => {
  const proxy = createProxy()
  const server = handleWsRequests(createServer(proxy), proxy)
  server.listen(proxyPort)

  console.log(`Listening on HTTPS port ${proxyPort}`)
  return server
}

const createProxy = () => {
  const proxy = httpProxy.createProxyServer({})
  proxy.on("error", (err, req, writable) => { // `writable` is a Response or Socket
    const [code, msg] = err.code === 'ECONNREFUSED'
      ? [503, 'service unavailable']
      : [500, "server error"]
    isResponse(writable)
      ? respondWithError(writable, code, msg)
      : writable.end("HTTP/1.1 503 Service Unavailable\r\n\r\n")
  })
  return proxy
}

const isResponse = writable => writable.constructor.name === 'ServerResponse'

const createServer = proxy => (
  http.createServer((req, res) => {
    var path = url.parse(req.url).pathname;
    if ( path == ropstenPath) {
      hasValidToken(req)
        ? proxy.web(req, res, { target: `http://${targetHost}:${ropstenHttpPort}` })
        : respondWithError(res, 401, "access denied")
    } else if ( path == mainnetPath) {
      hasValidToken(req)
        ? proxy.web(req, res, { target: `http://${targetHost}:${mainnetHttpPort}` })
        : respondWithError(res, 401, "access denied")
    } else {
      console.log("entered location not found block")
      respondWithError(res, 404, "Not Found")
    }
  })
)

const handleWsRequests = (server, proxy) => {
  server.on("upgrade", (req, socket, head) => {
    var path = url.parse(req.url).pathname;
    if ( path == ropstenPath) {
      console.log("entered network 1000 upgrade event")
      hasValidToken(req)
      ? proxy.ws(req, socket, head, { target: `ws://${targetHost}:${ropstenWsPort}` })
      : socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n")
    } else if ( path == mainnetPath) {
      console.log("entered network 1001 upgrade event")
      hasValidToken(req)
      ? proxy.ws(req, socket, head, { target: `ws://${targetHost}:${mainnetWsPort}` })
      : socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n")
    } else {
      console.log("entered location not found block")
      socket.end("HTTP/1.1 404 Not Found\r\n\r\n")
    }
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

module.exports = { run }
