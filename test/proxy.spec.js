const http = require("http")
const request = require('supertest')
const {expect} = require("chai")
const {run, targetHttpPort, targetHost, targetWsPort, proxyPort } = require("../src/proxy")
const {tokens} = require("../src/config")
const WebSocket = require("ws")

describe("secure proxy", () => {

  const token = Object.keys(tokens)[0]

  const runTarget = () => http
    .createServer((req, res)  => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({ foo: "bar" }))
      res.end()
    })
    .listen(targetHttpPort)

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

    it("handles a request to a disconnected server", async () => {
      await target.close()
      const response = await agent.post(`/?token=${token}`).send({bar: 'baz'}).expect(503)
      expect(response.body).to.eql({ error: "service unavailable" })
    })
  })

  describe("for a WS connection", () => {

    let wsClient, wsServer
    before(() => wsServer = new WebSocket.Server({port: targetWsPort }))
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

    describe("when target serverdisconnects", () => {
      beforeEach(() => {
        wsClient = new WebSocket(`ws://${targetHost}:${proxyPort}?token=${token}`)
        wsServer.close()
      })

      it("closes websocket gracefully", () => {
        wsClient.on("error", err => expect(err.message).to.eql("Unexpected server response: 503"))
      })
    })
  })
})
