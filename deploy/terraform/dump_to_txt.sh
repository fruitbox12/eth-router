#!/bin/bash

# TODO refactor to a relative or dependable path
if [ -z ${SECRETS_PATH+x} ];then
  printf "Need to set \$SECRETS_PATH\n"
  exit 1
else
  (cd $SECRETS_PATH && sops -d ansible-playbooks.yml | python -c 'import sys, yaml; print(yaml.load(sys.stdin)["rpc_proxy_vault"])')
fi
