#!/bin/bash

pushd `pwd` # save original path
cd `dirname "$0"` # cd to script path

# generate a self-signed SSL certificate
# requires openssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

popd # return to original path
