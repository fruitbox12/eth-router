const http = require("http")
const request = require('supertest')
const {expect} = require("chai")
const {run } = require("../src/proxy")
const { tokens, network: { proxyPort, targetHost, ropstenHttpPort, ropstenWsPort } } = require("../src/config")
const WebSocket = require("ws")

describe("secure proxy", () => {

  const token = Object.keys(tokens)[0]

  const runTarget = () => http
    .createServer((req, res)  => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({ foo: "bar" }))
      res.end()
    })
    .listen(ropstenHttpPort)

  let proxy, target

  before(() => {
    proxy = run()
    target = runTarget()
  })

  after(() => {
    proxy.close()
    try { target.close() } catch {}
  })

  describe("for an HTTP request", () => {

    const agent = request(`http://${targetHost}:${proxyPort}`)

    it("proxies a request with a valid token to target server", async () => {
      const response = await agent.post(`/?token=${token}`).send({bar: 'baz'}).expect(200)
      expect(response.body).to.eql({ foo: "bar" })
    })

    it("rejects an request with an invalid token", async () => {
      const res = await agent.post("/?token=malicious").send({steal: 'passwords!'}).expect(401)
      expect(res.body).to.eql({ error: "access denied" })
    })

    it("rejects a request with a missing token", async () => {
      const res = await agent.post("/?foo=bar").expect(401)
      expect(res.body).to.eql({ error: "access denied" })
    })

    describe("when target server disconnects", () => {

      beforeEach(() => target.close())
      afterEach(() => { try { target.close() } catch {} })

      it("responds to requests with 503 messages", async () => {
        const response = await agent.post(`/?token=${token}`).send({bar: 'baz'}).expect(503)
        expect(response.body).to.eql({ error: "service unavailable" })
      })

      it("recovers gracefully when a disconnected server is reconnected", async () => {
        target = await runTarget()
        const response = await agent.post(`/?token=${token}`).send({bar: 'baz'}).expect(200)
        expect(response.body).to.eql({ foo: "bar" })
      })

    })
  })

  describe("for a WS connection", () => {

    let wsClient, wsServer
    before(() => wsServer = new WebSocket.Server({port: ropstenWsPort }))
    after(() => wsServer.close())

    describe("with a valid token", () => {

      beforeEach(() => wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}/?token=${token}`))
      afterEach(() => wsClient.close())

      it("creates a proxied websocket connection", done => {
        wsServer.on("connection", ws => ws.on("message", msg => {
          expect(msg).to.eql("foo")
          done()
        }))
        wsClient.on("open", () => wsClient.send("foo"))
      })
    })

    describe("with an invalid token", () => {

      beforeEach(() => wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}/?token=invalid`))

      it("rejects a connection ;attempt", async () => {
        wsClient.on("error", err => expect(err.message).to.eql("Unexpected server response: 401"))
      })
    })

    describe("without any token", () => {

      beforeEach(() => wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}`))

      it("rejects a connection attempt", async () => {
        wsClient.on("error", err => expect(err.message).to.eql("Unexpected server response: 401"))
      })
    })

    describe("when target server disconnects", () => {

      describe("and a websocket is open", () => {
        beforeEach(() => {
          wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}?token=${token}`)
          wsServer.close()
        })

        it("closes an the websocket with a 503 message", () => {
          wsClient.on("error", err => expect(err.message).to.eql("Unexpected server response: 503"))
        })
      })

      describe("and a client attempts to open a new websocket", () => {
        beforeEach(()  =>  {
          wsServer.close()
          wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}?token=${token}`)
        })

        it("responds to a WS upgrade requests with 503 message", () => {
          wsClient.on("error", err => expect(err.message).to.eql("Unexpected server response: 503"))
        })
      })
    })

    describe("when target server disconnects then reconnects", () => {
      beforeEach(() => {
        wsServer.close()
        wsServer = new WebSocket.Server({port: ropstenWsPort })
        wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}/?token=${token}`)
      })

      it("handles websocket upgrade attempts", () => {
        wsServer.on("connection", ws => ws.on("message", msg => {
          expect(msg).to.eql("foo")
          done()
        }))
        wsClient.on("open", () => wsClient.send("foo"))
      })
    })
  })
})
