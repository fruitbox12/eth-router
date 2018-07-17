const https = require("https")
const http = require("http")
const {tokens} = require("./config")

// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint on target server

const httpProxy = require('http-proxy'),
      url = require('url'),
      fs = require('fs'),
      tlsConfig = require('./config').tls
      // targetHost = 'localhost',
      targetHost = "127.0.0.1",
      targetHttpPort = 8545,
      targetWsPort = 8546,
      proxyPort = 3000;

const {keyPath, certPath} = tlsConfig

const run = () => {
  const proxy = createProxy()
  const server = handleWsRequests(createServer(proxy), proxy)
  // const server = handleRequests(createServer())
  server.listen(proxyPort);
  console.log(`Listening on HTTPS port ${proxyPort}`);
  return server
}

// const createProxy = () => {
//   return httpProxy.createServer({
//     // target: `http://${targetHost}:${targetHttpPort}`,
//     // ssl: {
//     //   key: fs.readFileSync(keyPath, 'utf8'),
//     //   cert: fs.readFileSync(certPath, 'utf8')
//     // }
//   })
// }

const createProxy = () => {
  return httpProxy.createProxyServer({
  
  })
}

const createServer = proxy =>
  http.createServer((req, res) => proxy.web(req, res, {
      target: `http://${targetHost}:${targetHttpPort}`,
      ssl: {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      }
    })
  )

// proxy -> sever

const handleRequests = proxy => handleHttpRequests(proxy)

const handleHttpRequests = proxy =>
  https.createServer((req, res) => proxy.web(req, res))

const handleWsRequests = (server, proxy) => {
  server.on("upgrade", (req, socket, head) => {
    proxy.ws(req, socket, head, { target: `ws://${targetHost}:${targetWsPort}` })
  })
  return server
}


// const handleRequests = server => handleProxyRequests(server)

// const handleProxyRequests = server => {
//   // 'proxyReq' event called after TLS handshake, before passing request to server
//   server.on('proxyReq', (proxyReq, req, res, options) => {
//     authenticate(req, res)
//     if (isUpgrade(req)) createWsProxy(req, res)
//   })
//   return server
// }

// const handleWsUpgrade = server => {
//   server.on('upgrade', (req, socket, head) => {
//     console.log("Got WSS upgrade connection");
//     createWsProxy()
//   })
//   return server
// }

const createWsProxy = (req, res) => {
  console.log("wsProxy created")
  const proxy = httpProxy.createProxyServer({
    ws: true,
    target: `ws://${targetHost}:${targetWsPort}`,
    // ssl: {
    //   key: fs.readFileSync(keyPath, 'utf8'),
    //   cert: fs.readFileSync(certPath, 'utf8')
    // }
  })
  proxy.ws(req, req.socket, req.headers)
  // res.writeHead(302, {'Content-Type': 'application/json' })
  res.end()
}


// const createWsProxyDumb = () =>
//   httpProxy.createServer({
//     ws: true,
//     target: `ws://${targetHost}:${targetWsPort}`,
//     ssl: {
//       key: fs.readFileSync(keyPath, 'utf8'),
//       cert: fs.readFileSync(certPath, 'utf8')
//     }
//   }).listen(targetWsPort)

const isUpgrade = req =>
  req.headers.connection === "Upgrade" &&
  req.headers.upgrade === "websocket"

const authenticate = (req, res)  => {
  if (!tokens[parseToken(req)]) {
    res.writeHead(401, {'Content-Type': 'application/json' })
    res.write(JSON.stringify({ error: "access denied" }))
    res.end()
  }
}

const parseToken = (req) =>
  url.parse(req.url, true).query['token']


module.exports = {
  run,
  targetHost,
  targetHttpPort,
  targetWsPort,
  proxyPort,
}
