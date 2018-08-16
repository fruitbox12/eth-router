# Gatling benchmarking for eth-router

Some simple benchmarking.

### How to run:

0. Download and unpack [Gatling](https://gatling.io)
1. Simplify later commands and reveal the munitions

```bash
  $ export GATLING_HOME=where/ever/you/put/it
```

2. Get situated

```bash
  $ cd ${GATLING_HOME}
```

3. Make a text file called `token.txt` containing a valid authentication token

```bash
  $ cat > token.txt
mysupersecuretokeninplaintext
^D
```

4. Make a directory with the simluations package name (e.g. `qs`) in 

```bash
  $ mkdir ${GATLING_HOME}/user-files/simulations/qs
```

5. Copy [this](SecureRPC.scala) file (`SecureRPC.scala`) into directory above

6. Set up the environment 

```bash
  $ export JAVA_OPTS="-DSRPC_TOKEN=`cat ./token.txt` -DSRPC_DOMAIN=stg.rpc.mysweetdomain.com -DSRPC_USERS=25 -DSRPC_ITERS=100"
```

7. Let 'er rip

```bash
  $ ./bin/gatling.sh
```

### Debugging request/responses

Change `WARN` to `DEBUG` in `${GATLING_HOME}/conf/logback.xml`

Gatling docs [reference](https://gatling.io/docs/2.3/general/debugging/)
