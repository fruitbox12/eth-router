const tokensCfg = require("./tokens")

const getEnv = (cfg) => cfg[process.env.NODE_ENV || "production"]

module.exports = {
  tokens: getEnv(tokensCfg),
}
