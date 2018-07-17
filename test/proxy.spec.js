const fs = require('fs')
const http = require("http")
const request = require('supertest')
const {expect} = require("chai")
const {run, targetHttpPort, targetHost, targetWsPort, proxyPort } = require("../src/proxy")
const {tokens} = require("../src/config")
const {client: WsClient, server: WsServer} = require('websocket')
const WebSocket = require("ws")

describe("secure proxy", () => {
  const token = Object.keys(tokens)[0]
  const ca = fs.readFileSync('certs/ca/my-root-ca.crt.pem');
  const runTarget = () => http
    .createServer((req, res)  => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({ foo: "bar" }))
      res.end()
    })
    .listen(targetHttpPort)

  let proxy, target

  describe("with TLS", () => {
  
    before(() => {
      proxy = run()
      target = runTarget()
    })
  
    after(() => {
      proxy.close()
      target.close()
    })
    
    describe("for an HTTP request", () => {
  
      const agent = request(`https://${targetHost}:${proxyPort}`)
  
      it("proxies a request with a valid token to target server", async () => {
        const response = await agent
          .post(`/?token=${token}`)
          .ca(ca)
          .send({bar: 'baz'})
          .expect(200)
    
        expect(response.body).to.eql({ foo: "bar" })
      })
    
      it("rejects an request with an invalid token", async () => {
        const res = await agent
          .post("/?token=malicious")
          .ca(ca)
          .send({steal: 'passwords!'})
          .expect(401)
      
        expect(res.body).to.eql({ error: "access denied" })
      })
    
      it("rejects a request with a missing token", async () => {
        const res = await agent
          .post("/?foo=bar")
          .ca(ca)
          .expect(401)
      
        expect(res.body).to.eql({ error: "access denied" })
      })
    })
    
    describe("for a WS connection", () => {
      
      it("upgrades to a WS connection", async () => {
        const resp = await request(`https://${targetHost}:${proxyPort}`)
          .post(`/?token=${token}`)
          .ca(ca)
          .set("Content-type", "application/json")
          .set("Connection",  "upgrade")
          .set("Upgrade", "websocket")
          .expect(200)

        expect(resp.body).to.eql({})
      })


      const options = {
        tlsOptions: {
          ca,
          checkServerIdentity: (host, cert) => {
            if (host != cert.subject.CN) return "checkServerIdentity: mismatched:" + host;
          }
        }
      }

      it("proxies a request with a valid token", done => {
        // const client = new WsClient(options)
        // const server =
        // client.on('connect', done)
        // client.connect(`ws://${targetHost}:${proxyPort}/?token=${token}`)
        const server = new WebSocket.Server({port: targetWsPort })
        server.on("connection", () => {
          console.log("connected!")
        })
        server.on("message", data => {
          console.log("message: ", data)
          done()
        })
        const client = new WebSocket(`ws://${targetHost}:${proxyPort}/?token=${token}`)
        client.on("open", () => client.send("FOOOBAR!!!!"))
      })
    })
  })
  
  
  describe("without TLS", () => {

    describe("for a websocket", () => {
      let wsClient, wsServer
      beforeEach(() => {
        proxy = run()
        wsServer = new WebSocket.Server({port: targetWsPort })
        wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}/?token=${token}`)
      })
      afterEach(() => {
        wsServer.close()
        wsClient.close()
        proxy.close()
      })

      it("creates a proxied websocket connection", done => {
        wsServer.on("connection", ws => ws.on("message", msg => { expect(msg).to.eql("foo"); done(); }))
        wsClient.on("open", () => wsClient.send("foo"))
      })
    })
    
    describe("for an htpp request", () => {
      // TODO: it should close the connection!
      const agent = request(`http://${targetHost}:${proxyPort}`)

      beforeEach(() => {
        proxy = run()
        target = runTarget()
      })
      afterEach(() => {
        proxy.close()
        target.close()
      })
      
      it("proxies a request to target server", async () => {
        // TODO: it should close the connection!
        const response = await agent
          .post(`/?token=${token}`)
          .ca(ca)
          .send({bar: 'baz'})
          .catch(e => e)
    
        expect(response.body).to.eql({ foo: "bar" })
        // expect(err.code).to.eql("ECONNRESET")
        // expect(err.message).to.eql("socket hang up")
      })
    })
  })
})
