const http = require("http")
const request = require('supertest')
const {expect} = require("chai")
const {run, targetHttpPort, proxyPort } = require("../src/secureProxy")

describe("secure proxy", () => {
  const proxy = run()
  const target = http.createServer((req, res)  => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({ foo: "bar" }))
    res.end()
  }).listen(targetHttpPort)

  const agent = request(`http://localhost:${proxyPort}`)

  after(() => {
    proxy.close()
    target.close()
  })

  it("proxies a request to a target server", async () => {
    const response = await agent
      .post("/?token=foo")
      .send({bar: 'baz'})
      .expect(200)

    expect(response.body)
      .to.eql({ foo: "bar" })
  })
  
  it("rejects a request with an invalid token", async () => {
    const res = await agent
      .post("/?token=malicious")
      .send({steal: 'passwords!'})
      .expect(401)

    expect(res.body)
      .to.eql({ error: "access denied" })
  })
})

