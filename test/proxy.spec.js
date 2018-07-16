const fs = require('fs')
const http = require("http")
const request = require('supertest')
const {expect} = require("chai")
const {run, targetHttpPort, proxyPort } = require("../src/proxy")
const {tokens} = require("../src/config")


describe("secure proxy", () => {

  const target = http
    .createServer((req, res)  => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({ foo: "bar" }))
      res.end()
    })
    .listen(targetHttpPort)

  const proxy = run()
  const token = Object.keys(tokens)[0]
  const ca = fs.readFileSync('certs/ca/my-root-ca.crt.pem');

  after(() => {
    proxy.close()
    target.close()
  })

  describe("with TLS", () => {
    const agent = request(`https://localhost:${proxyPort}`)

    it("proxies a request with a valid token to target server", async () => {
      const response = await agent
        .post(`/?token=${token}`)
        .ca(ca)
        .send({bar: 'baz'})
        .expect(200)

      expect(response.body).to.eql({ foo: "bar" })
    })

    it("rejects a request with an invalid token", async () => {
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

  describe("without TLS", () => {
    const agent = request(`http://localhost:${proxyPort}`)

    it("will not accept requests", async () => {
      const err = await agent
        .post(`/?token=${token}`)
        .ca(ca)
        .send({bar: 'baz'})
        .catch(e => e)

      expect(err.code).to.eql("ECONNRESET")
      expect(err.message).to.eql("socket hang up")
    })
  })
})
