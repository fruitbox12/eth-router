#!/bin/bash

if [ -z ${SECRETS_PATH+x} ];then
  printf "Need to set \$SECRETS_PATH\n"
  exit 1
else
  (sops -d $SECRETS_PATH/ansible-playbooks.yml | python -c 'import sys, yaml; print(yaml.load(sys.stdin)["rpc_proxy_vault"])')
fi
