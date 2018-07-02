# Ansible playbook for a secure Ethereum proxy

## Getting Started

* Launch your AWS services with the Terraform template in this repository
* Install ansible
* Add the IP address of the host you built with Terraform to `hosts`
* Add SSH key allowed to connect to `hosts` to `ssh-agent`
* Replace the encrypted values from [ansible-vault](https://docs.ansible.com/ansible/2.4/vault.html) with your own
* Run the playbook `ansible-playbook -i hosts -u ubuntu site.yml`

## DNS

TODO: document DNS situation

## TLS Security
The playbook uses the [certbot role](https://github.com/geerlingguy/ansible-role-certbot) to enable automated SSL certificate signing. You are required to run the Terraform template to set up DNS for this automation to succeed. The role uses the `standalone` validation method, which depends on DNS resolution to point to the server you are configuring and for ports 80 and 443 to be open and available.

## Vault

TODO: document ansible vault



