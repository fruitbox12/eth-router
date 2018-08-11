const {expect} = require("chai")
const configs = require("../src/config")

describe("configs", () => {

  it("has a Set of tokens", () => {
    expect(configs.tokens).to.eql({
      "ebf427e77668d2aed05c558c15f8a2255bd9f30b69c8bac4dc7d61d0ccc832b6": true,
      "d7ea27d3d20656533a89afb196a24a1aff814c0f2ad411d82e563f7c1d917854": true
    })
  })

  it("provides token configs for every environment", () => {
    ["production", "test", "development"].forEach(
      env => expect(require("../src/config/tokens")[env]).to.exist
    )
  })
})
