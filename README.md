# eth-router

*A secure RPC proxy to an Ethereum blockchain*

* Built with node.js
* Reverse proxying via node-http-proxy
* Infrastructure modeled in Terraform
* Bootstrapped with Anslble playbooks
* TLS using Let's Encrypt
* Supports HTTPS and WebSockets

## Why is this useful?

A an application connection to an RPC has no built in authentication or transport layer security. By adding a SSL terminator with a CA signed certificate from Let's Encrypt and a reverse proxy in node.js, the following features could be built

* Authentication with API tokens
* Oauth or SAML security
* API transformations to extend the web3 specification
* One gateway to many backend networks (Mainnet, various testing networks, private blockchains)

## API endpoint mapping

`{application}` = "geth", "parity"
`{proto}` = "wss", "https"

domain: `{proto}://eth.example.com`
Foundation (mainnet) location: `/{application}/mainnet`
Ropsten: `/{applicaton}/ropsten`
Kovan: `/{applicaton}/kovan`
Rinkeby: `/{applicaton}/rinkeby`
Dev RPC: `/{application}/development`

# node.js stuff

The file `proxy.js` is a very small node application that does reverse proxying. It supports the WebSocket 'upgrade' event to serve two protocols over the same connection. It also supports SSL termination for HTTPS on the frontend and HTTP on the back.

HTTPS with a self-signed certificate is not supported with geth as of `1.8.4-unstable` but it can be tested by sending raw JSON data with a self-signed certificate via cURL. Production deployment will use a verified cert.

The following returns the sync status of the node

```
curl -k -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":74}' https://localhost:3000
```

To generate self-signed certs, run the script in `ssl/gen-self-signed.sh`

The confusingly named Web3 HttpProvider also supports HTTPS. Just pass it an HTTPS URL and it "just works". [Documentation on medium](https://blog.infura.io/getting-started-with-infura-28e41844cc89).

Secure WebSocket connections are also difficult to test with local self-signed certificates. You can get almost across the line with the following baroque dance using cURL with custom headers and self-signed certificates.

```
curl -v -k -X POST --include \
     --no-buffer \
     --header "Content-type: application/json" \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Host: localhost:3000" \
     --header "Origin: https://localhost:3000" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":74}' \
     https://localhost:3000/?token=foo
```

The response should look something like `invalid content type, only application/json is supported` which meant that cURL connected to the RPC and got a response that it sent the wrong content-type! Great success!

## Infrastructure

The `deploy` directory has a Terraform template which will build a server instance in AWS, create security groups and attach a domain name. (look in the configuration for details)

When the instance is online, you can bootstrap the node with the Ansible playbook named `proxy.yml`. This will generate a SSL certificate for the domain you specify in the file.

If you would like to manually generate the certificate, read the next section.

## Let's Encrypt

SSL certificates can be served via let's encrypt. Here's how...

* Install [Certbot](https://certbot.eff.org/lets-encrypt/ubuntuxenial-other)
* Generate a certificate with the `certonly` mode for a "standalone" webserver
* If there is an error, ensure port 80 is open to the public internet
* Copy certificates to `./ssl/`
* Update `proxy.js` to read signed certificates
* A cron job was installed to automatically renew. To manually verify expiration time, run `sudo certbot renew --dry-run`


## Port mapping

The ports start at TCP `8545` for the default development route and go up from there.

## Development and Testing

### Install

* Install geth and/or parity: https://geth.ethereum.org/downloads/
* Install node v. 10.4.0: https://nodejs.org/en/
* Install yarn: https://yarnpkg.com/lang/en/docs/install/
* Install node dependencies: `yarn install`

(TK-TODO: provide bash scripts for doing this in either MacOs or Debian-like Linux)

### Run

You will need 3 console terminals! To run each of these 3 processes:

1. Start a geth node in development mode on localhost (it will act as Proof of Authority):

``` shell
$ ./bin/run-geth-dev
```

2. Start a proxy server filtering requests to the geth node:

``` shell
$ ./bin/run-proxy-dev
```
(As a smoke test, use the SecureWebsocket connection curl script above to make sure the proxy is working.)

3. Attach a console to the running geth node (use it to test your proxy!):
``` shell
$ ./bin/run-get-dev-console
```
