var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    fs = require('fs');

var proxy = httpProxy.createProxyServer({ ws: true });

proxyServer = http.createServer(function(req,res) {
  var query = url.parse(req.url, true).query;
  if ( query['token'] === tokenRecord) {
    proxy.web(req,res,{ target: 'http://localhost:8545',
                        ssl: {
                          key: fs.readFileSync('ssl/key.pem', 'utf8'),
                          cert: fs.readFileSync('ssl/cert.pem', 'utf8')
                        }
                      });
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
