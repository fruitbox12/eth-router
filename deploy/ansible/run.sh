#!/bin/sh

tokens_path="../../src/config/tokens/production.json"
proxy_playbook_path="./roles/ethrouter/files"
playbook=$1

case $playbook in
proxy)
  cp ${tokens_path} ${proxy_playbook_path}
  ansible-playbook --vault-password-file ../terraform/dump_to_txt.sh -i hosts -u ubuntu proxy.yml
  rm "${proxy_playbook_path}/production.json"
  ;;
blockchain)
  ansible-playbook --vault-password-file ../terraform/dump_to_txt.sh -i hosts -u ubuntu blockchain.yml
  ;;
*)
  echo "Invalid argument. Choose a type 'proxy' or 'blockchain'"
  ;;
esac
