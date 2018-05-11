# Eth-router

*A HTTP router to add API features to Ethereum RPC interfaces*

* Built with Ruby 2.5.1 and Rails 5.1.6
* Reverse proxying in Rack via rails-reverse-proxy
* Bootstrapped with `rails new eth-router --api`, depends on one or many full synced ethereum applications that provide an HTTP interface. geth and Parity are the ones that exist as of this writing
* Controllers location have one backend URL
* Deployment instructions

## Why is this useful?

* Authentication with API tokens
* Oauth or SAML security
* Possible API transformations to extend the web3 specification
* One gateway to many backend networks (Mainnet, various testing networks, private blockchains)

## API endpoint mapping

`{application}` = "geth", "parity"  
`{proto}` = "ws", "http"  

domain: `{proto}://eth.quantstamp.com`  
Foundation (mainnet) location: `/{application}/`  
Ropsten: `/{applicaton}/ropsten`  
Kovan: `/{applicaton}/kovan`  
Rinkeby: `/{applicaton}/rinkeby`  

## Adding a new endpoint

For example, a new network named `casper` for the geth application using HTTP protocol

`rails generate controller Geth casper`

Add a route to `routes.rb` allowing  POST to that controller, like

`post 'geth/casper'`

## Port mapping

The ports start at TCP `8545` for the default development route and go up from there.

## Development and Testing

Enable a geth node as a Proof of Authority development node on localhost

`geth --dev --rpc`