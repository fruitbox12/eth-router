#!/bin/bash

# TODO refactor to a relative or dependable path
(cd ~/Desktop/quantstamp/secrets && sops -d ansible-playbooks.yml | python -c 'import sys, yaml; print(yaml.load(sys.stdin)["rpc_proxy_vault"])')
