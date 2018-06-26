## Ansible playbook for a secure Ethereum proxy

* Install ansible
* Add SSH key to `ssh-agent`
* Add the IP address of the host you built with Terraform to `hosts`
* Run the playbook `ansible-playbook -i hosts -u ubuntu site.yml`

The playbook uses the [Let's Encrypt module](https://docs.ansible.com/ansible/2.4/letsencrypt_module.html) to enable SSL.