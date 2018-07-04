const http = require('http')

http.createServer((req, res)  => {
  res.writeHead(200, {'Content-Type': 'application/json' })
  res.write(JSON.stringify({ foo: "bar" }))
  res.end()
}).listen(8545)
