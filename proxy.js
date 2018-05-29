// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({ws: true});

proxyServer = http.createServer(function(req,res) {
  proxy.web(req,res,{ target: 'http://localhost:8545'});
});

// upgradable proxy.
// uses the WebSocket upgrade event to switch to a ws proxy
proxyServer.on('upgrade', function(req,socket,head) {
  proxy.ws(req,socket,head, {target: 'ws://localhost:8546'});
});

proxyServer.listen(9000);
console.log("listening on port 9000");
