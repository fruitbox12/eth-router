provider "aws" {
  region = "${var.region}"
  shared_credentials_file = "${var.shared_credentials_file}"
  profile                 = "${var.shared_credentials_profile}"
}


module "proxy" {
  source = "./modules/proxy"
  key_name = "${var.rpc_proxy_key_name}" 
  region = "${var.region}"
  dns_name = "testnet.com"
  #amis = "${var.ami_map}"
}


module "blockchain" {
  source = "./modules/blockchain"
  key_name = "${var.blockchain_key_name}" 
  region = "${var.region}"
  #amis = "${var.ami_map}"
}


# might want a local-exec for this at some point: 
# ssh-keyscan -H {{ inventory_hostname }} >> ~/.ssh/known_hosts


resource "null_resource" "ansible_configure" {
  depends_on = [
    "local_file.ansible_hosts"
  ]

  provisioner "local-exec" {
    working_dir = "${path.module}/../ansible"
    command = "ansible-playbook --vault-password-file ${path.module}/dump_to_txt.sh -i hosts -u ubuntu blockchain.yml"
    #environment {
    #  ANSIBLE_VAULT_PASSWORD = "${data.external.sops_secrets.result.rpc_proxy_vault}"
    #}
  }
}
