# Ansible playbook for a secure Ethereum proxy

## Vault

This role contains encrypted secrets. There is a master key for the vault in the secrets repository. Ask your org's Head of Security or Head of Infrastructure for access to this information. When you have this information, you can run the playbook as documented above.

## TLS Security
The playbook uses the [certbot role](https://github.com/geerlingguy/ansible-role-certbot) to enable automated SSL certificate signing. You are required to run the Terraform template to set up DNS for this automation to succeed. The role uses the `standalone` validation method, which depends on DNS resolution to point to the server you are configuring and for ports 80 and 443 to be open and available.


## DNS

The Terraform template which was used to bootstrap the cloud infrastructure requires a DNS name and depends on Amazon Route53. You set this information in the secret variable `vars.ssl_hostname` in `proxy.yml`.

## SSH Tunnels

The playbook named `blockchain.yml` is a bit idiosyntratic to the author's installation but provides something generally useful. It answers the question "how do I decouple a blockchain RPC from the secure proxy?"

The solution provided depends on reverse SSH tunnels and systemd. There is an encrypted private key in `roles/blockchain/files/geth-http` which cannot be decrypted outside of the author's installation. You must create (or copy) your own private key and encrypt it using `ansible-vault`.

The idea is to host all blockchain data and the RPC services to access it on a private network, then expose these services by connecting a reverse SSH tunnel to the proxy server built with the `proxy.yml` playbook.

## Installation

* Launch your AWS services with the Terraform template in this repository
* Install ansible
* Add the IP address of the host you built with Terraform to the proxy group in `hosts`
* Add SSH key allowed to connect to `hosts` to `ssh-agent`
* Replace the encrypted values from [ansible-vault](https://docs.ansible.com/ansible/2.4/vault.html) with your own
* Run the playbook `ansible-playbook --vault-password-file ../terraform/dump_to_txt.sh -i hosts -u ubuntu proxy.yml -e "ssl_hostname=$TF_VAR_dns_name"`
* Enter your master key when prompted
* Add the IP address of your blockchain node to `hosts`
* Run the playbook `ansible-playbook --vault-password-file ../terraform/dump_to_txt.sh -i hosts -u ubuntu blockchain.yml -e "proxy_hostname=$TF_VAR_dns_name data_disk=/dev/xvdg"`

Note the `data_disk` variable which is passed at runtime. There are some instance sized, notably the [R Memory Optimized](https://aws.amazon.com/ec2/instance-types/) series which uses NVMe storage and has device strings that resemble `/dev/nvme[0-9]`.

## Architecture considerations

### Data storage

It's possible to run both playbooks on the same instance. As of 2018-07-05 the Ethereum blockchain data exceeds 1TB for all the networks included by default in this playbook. This playbook provisions a 1TB volume in cloud storage. Change this variable if you do not want all networks in this playbook to run.

In contrast, on the same date a 8TB spining disk HDD costs about US $160. 1TB SSDs get cheaper by the month. This lead to the movtivation to decouple the blockchain data from the proxy in this repo.

### Network ports

All these proxy tricks require some precise port mapping between many different applications. This information is located in the list `vars.blockchain_apps` in the `blockchain.yml` playbook.

### Memory resources

The go-ethereum client `geth` has higher than average resource requirments. Notably, for mainnet blockchain sync a disk cache of > 4GB is normal at the time of this writing. This limits which EC2 instances are compatible with this node type.

The testnets require significantly lower resources. Trial and error is the best option.
