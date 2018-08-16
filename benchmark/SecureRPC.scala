package qs

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

/* 
 * How to run:
 *
 * 0. Download and unpack Gatling, 
 * 1. export GATLING_HOME=where/ever/you/put/it
 * 2. cd ${GATLING_HOME}
 * 3. Make a text file called `token.txt` containing a valid authentication token
 * 4. Make a directory with this file's package name (e.g. `qs`) in ${GATLING_HOME}/user-files/simulations
 * 5. Copy this file into that directory
 * 6. export JAVA_OPTS="-DSRPC_TOKEN=`cat ./token.txt` -DSRPC_DOMAIN=stg.rpc.mysweetdomain.com"
 * 7. ./bin/gatling.sh
 *
 */
class SecureRPC extends Simulation {

  /* TODO - our URL-based routing complicates this a bit
  val mainnetHttpsUrl = System.getProperty("SRPC_HTTPS_MAIN")
  val testnetHttpsUrl = System.getProperty("SRPC_HTTPS_TEST")
  val mainnetWssUrl = System.getProperty("SRPC_WSS_MAIN")
  val testnetWssUrl = System.getProperty("SRPC_WSS_TEST")
  */

  val rpcDomain = System.getProperty("SRPC_DOMAIN")
  val rpcToken = System.getProperty("SRPC_TOKEN")
  val testPayload = """{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":74}"""
  val concurrentUsers = System.getProperty("SRPC_USERS").toInt
  val testIterations = System.getProperty("SRPC_ITERS").toInt

  val httpConf = http
    .baseURL("https://" + rpcDomain)
    .acceptHeader("application/json")
    .wsBaseURL("wss://" + rpcDomain)

  val httpsTestnetScenario = scenario("Secure HTTP - testnet")
    .exec(session => session.set("key", rpcToken))
    .exec(http("Heartbeat testnet")
        .get("/")
        .header("Content-Type", "application/json")
        .queryParam("token", "${key}")
        .check(status.is(200), bodyString.is("")))
    .pause(10 milliseconds)
    .repeat(testIterations, "i") {
      exec(http("Poke testnet JSON-RPC")
        .post("/")
        .header("Content-Type", "application/json")
        .queryParam("token", "${key}")
        .body(StringBody(testPayload)).asJSON
        .check(status.is(200), jsonPath("$..jsonrpc").ofType[String]))
        // "jsonrpc":"2.0"
        //.pause(10 milliseconds)
    }

  val httpsMainnetScenario = scenario("Secure HTTP - mainnet")
    .exec(session => session.set("key", rpcToken))
    .exec(http("Heartbeat mainnet")
        .get("/mainnet")
        .header("Content-Type", "application/json")
        .queryParam("token", "${key}")
        .check(status.is(200), bodyString.is("")))
    .pause(10 milliseconds)
    .repeat(testIterations, "i") {
      exec(http("Poke mainnet JSON-RPC")
        .post("/mainnet")
        .header("Content-Type", "application/json")
        .queryParam("token", "${key}")
        .body(StringBody(testPayload)).asJSON
        .check(status.is(200), jsonPath("$..jsonrpc").ofType[String]))
        // "jsonrpc":"2.0"
        //.pause(10 milliseconds)
    }

  val wssTestnetScenario = scenario("Secure WebSocket - testnet")
    .exec(session => session.set("key", rpcToken))
    .exec(http("testnet WSS home")
      .get("/?token=${key}")
      .header("Content-Type", "application/json"))
    .exec(ws("Connect WSS testnet").open("/?token=${key}"))
    .pause(10 milliseconds)
    .repeat(testIterations, "i") {
      exec(ws("Poke testnet WSS")
        .sendText(testPayload)
        .check(wsAwait.within(3).until(1).jsonPath("$..jsonrpc").ofType[String]))
        // "startingBlock":"0x0"
        //.pause(10 milliseconds)
    }
    .exec(ws("Close WSS testnet").close)

  val wssMainnetScenario = scenario("Secure WebSocket - mainnet")
    .exec(session => session.set("key", rpcToken))
    .exec(http("mainnet WSS home")
      .get("/mainnet?token=${key}")
      .header("Content-Type", "application/json"))
    .exec(ws("Connect WSS mainnet").open("/mainnet?token=${key}"))
    .pause(10 milliseconds)
    .repeat(testIterations, "i") {
      exec(ws("Poke mainnet WSS")
        .sendText(testPayload)
        .check(wsAwait.within(3).until(1).jsonPath("$..jsonrpc").ofType[String]))
        // "startingBlock":"0x0"
        //.pause(10 milliseconds)
    }
    .exec(ws("Close WSS mainnet").close)

  setUp(
    httpsTestnetScenario.inject(atOnceUsers(concurrentUsers)),
    httpsMainnetScenario.inject(atOnceUsers(concurrentUsers)),
    wssTestnetScenario.inject(atOnceUsers(concurrentUsers)),
    wssMainnetScenario.inject(atOnceUsers(concurrentUsers))
  ).protocols(httpConf)
}

