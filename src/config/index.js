const tokensCfg = require("./tokens")
const networkCfg = require("./network")

const getEnv = (cfg) => cfg[process.env.NODE_ENV || "production"]

module.exports = {
  tokens: getEnv(tokensCfg),
  network: getEnv(networkCfg),
}
