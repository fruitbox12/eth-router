const tokensCfg = require("./tokens")
const tlsCfg = require("./tls")

const getEnv = (cfg) => cfg[process.env.NODE_ENV || "production"]

module.exports = {
  tokens: getEnv(tokensCfg),
  tls: getEnv(tlsCfg)
}
