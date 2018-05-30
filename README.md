# Eth-router

*A HTTP router to add API features to Ethereum RPC interfaces*

* Built with Ruby 2.5.1 and Rails 5.1.6
* Reverse proxying in Rack via rails-reverse-proxy
* Bootstrapped with `rails new eth-router --api`, depends on one or many full synced ethereum applications that provide a HTTP interface (geth and Parity are the ones that exist as of this writing)

## Why is this useful?

A an application connection to an RPC doesn't expose many features and has no built in authentication. This is a layer to add some of that. Any features available in Rails could be used with this router as a departure point. Things such as

* Authentication with API tokens
* Oauth or SAML security
* API transformations to extend the web3 specification
* One gateway to many backend networks (Mainnet, various testing networks, private blockchains)
* Do "blockchain stuff" in a relational database

## API endpoint mapping

`{application}` = "geth", "parity"  
`{proto}` = "ws", "http"  

domain: `{proto}://eth.example.com`  
Foundation (mainnet) location: `/{application}/mainnet`  
Ropsten: `/{applicaton}/ropsten`  
Kovan: `/{applicaton}/kovan`  
Rinkeby: `/{applicaton}/rinkeby`  
Dev RPC: `/{application}/development`

# node.js stuff

The file `proxy.js` is a very small node application that does reverse proxying. It supports the WebSocket 'upgrade' event to server two protocols over the same connection. It also supports SSL termination for HTTPS on the frontend and HTTP on the back.

HTTPS with a self-signed certificate is not supported with geth as of `1.8.4-unstable` but it can be tested by sending raw JSON data with a self-signed certificate via cURL. Production deployment will use a verified cert.

The following returns the sync status of the node

```
curl -k -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":74}' https://localhost:9001
```

To generate self-signed certs, run the script in `ssl/gen-self-signed.sh`

The confusingly named Web3 HttpProvider also supports HTTPS. Just pass it an HTTPS URL and it "just works". [Documentation on medium](https://blog.infura.io/getting-started-with-infura-28e41844cc89).

## Let's Encrypt

SSL certificates can be served via let's encrypt. Here's how...

* Install [Certbot](https://certbot.eff.org/lets-encrypt/ubuntuxenial-other)
* Generate a certificate with the `certonly` mode for a "standalone" webserver
* If there is an error, ensure port 80 is open to the public internet
* Copy certificates to `./ssl/`
* Update `proxy.js` to read signed certificates
* A cron job was installed to automatically renew. To manually verify expiration time, run `sudo certbot renew --dry-run`

# Rails stuff

## Adding a new endpoint

For example, a new network named `casper` for the geth application using HTTP protocol

`rails generate controller Geth casper`

Add a route to `routes.rb` allowing  POST to that controller, like

`post 'geth/casper'`

## Port mapping

The ports start at TCP `8545` for the default development route and go up from there.

## Development and Testing

Install geth and/or parity.

Enable a geth node as a Proof of Authority development node on localhost

`geth --dev --rpc --rpcapi=personal,web3,eth,rpc`

Get Ruby 2.5.1. I recommend `chruby` and `ruby-install`. Install dependencies. Start server. Connect geth.

```
ruby-install ruby 2.5.1
chruby 2.5.1
bundle install
rails server
```

In another shell connect to a console with `geth attach http://localhost:3000/geth/development`