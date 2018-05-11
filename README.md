# Eth-router

*A HTTP router to add API features to Ethereum RPC interfaces*

* Built with Ruby 2.5.1 and Rails 5.1.6
* Reverse proxying in Rack via rails-reverse-proxy
* Bootstrapped with `rails new eth-router --api`, depends on one or many full synced ethereum applications that provide a HTTP interface (geth and Parity are the ones that exist as of this writing)

## Why is this useful?

A remote application connect to an RPC doesn't expose many features and has no built in authentication. This is a layer to add some of that. Any features available in Rails could be used with this router as a departure point. Things such as

* Authentication with API tokens
* Oauth or SAML security
* Possible API transformations to extend the web3 specification
* One gateway to many backend networks (Mainnet, various testing networks, private blockchains)

## API endpoint mapping

`{application}` = "geth", "parity"  
`{proto}` = "ws", "http"  

domain: `{proto}://eth.example.com`  
Foundation (mainnet) location: `/{application}/mainnet`  
Ropsten: `/{applicaton}/ropsten`  
Kovan: `/{applicaton}/kovan`  
Rinkeby: `/{applicaton}/rinkeby`  
Dev RPC: `/{application}/development`

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

`geth --dev --rpc`

Get Ruby 2.5.1. I recommend `chruby` and `ruby-install`. Install dependencies. Start server. Connect geth.

```
ruby-install ruby 2.5.1
chruby 2.5.1
bundle install
rails server
```

In another shell connect to a console with `geth attach http://localhost:3000/geth/development`