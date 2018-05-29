// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

const querystring = require('querystring');

var proxy = httpProxy.createProxyServer({ws: true});
var tokenRecord = 'foo';

proxyServer = http.createServer(function(req,res) {
  var query = url.parse(req.url, true).query;
  if ( query['token'] === tokenRecord) {
    proxy.web(req,res,{ target: 'http://localhost:8545'});
  } else {
    res.write('access denied');
    res.end();
  }
});

// upgradable proxy.
// uses the WebSocket upgrade event to switch to a ws proxy
proxyServer.on('upgrade', function(req,socket,head) {
  var query = url.parse(req.url, true).query;
  if ( query['token'] === tokenRecord) {
    proxy.ws(req,socket,head, {target: 'ws://localhost:8546'});
  } else {
    socket.write('access denied');
    socket.end();
  }
});

proxyServer.listen(9000);
console.log("listening on port 9000");
