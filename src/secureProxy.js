// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    fs = require('fs');

const querystring = require('querystring');
var tokenRecord = 'foo';

// web3 library support for SSL is not supported for self-signed certificates
// cURL is. See README for details.
secureProxyServer = httpProxy.createServer(
{ target: 'http://localhost:8545',
  ssl: {
    key: fs.readFileSync('ssl/key.pem', 'utf8'),
    cert: fs.readFileSync('ssl/cert.pem', 'utf8')
  }
});

// this is an event called proxyReq. It is called after the TLS handshake and before passing the request to the backend. This is where token authentication should happen
secureProxyServer.on('proxyReq', function(proxyReq, req, res, options) {
  var query = url.parse(req.url, true).query;
  console.log("Got HTTPS request with token " + query['token'])
  if ( query['token'] !== tokenRecord) {
    res.write('access denied');
    res.end();
  }
  secureProxyServer.on('upgrade', function(req,socket,head) {
    var proxy = httpProxy.createProxyServer({
      ws: true
    });
    //var query = url.parse(req.url, true).query;
    console.log("Got WSS upgrade connection");
    proxy.ws(req,socket,head, {target: 'ws://localhost:8546'});
  });
});

secureProxyServer.listen(3000);
console.log("listening on HTTPS port 3000");
