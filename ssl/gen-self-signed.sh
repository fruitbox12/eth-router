#!/bin/bash
# generate a self-signed SSL certificate
# requires openssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
