// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP and WebSocket endpoint

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});
httpProxy.createServer({
  target: 'ws://localhost:8546',
  ws: true
}).listen(9001);

http.createServer(function(req,res) {
  proxy.web(req,res,{ target: 'http://localhost:8545'});
}).listen(9000);

console.log("listening on port 9000 and 9001");
