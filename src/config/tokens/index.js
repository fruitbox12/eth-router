const development = require("./development")
const test = require("./test")

let production
try {
  production = require("./production")
} catch {
  production = {}
}

module.exports = { development, production, test }
