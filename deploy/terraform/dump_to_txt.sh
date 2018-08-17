#!/bin/bash

# TODO refactor to a relative or dependable path
printf "Need to set \$SECRETS_PATH\n"
(cd $SECRETS_PATH && sops -d ansible-playbooks.yml | python -c 'import sys, yaml; print(yaml.load(sys.stdin)["rpc_proxy_vault"])')
