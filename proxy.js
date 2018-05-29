// A reverse proxy server for many ethereum blockchain backends
// Requires a valid web3 HTTP or WebSocket endpoint

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req,res) {
  proxy.web(req,res,{ target: 'http://localhost:8545'});
});
console.log("listening on port 9000");
server.listen(9000);
