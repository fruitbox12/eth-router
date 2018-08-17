provider "aws" {
  region                  = "${var.region}"
  shared_credentials_file = "${var.shared_credentials_file}"
  profile                 = "${var.shared_credentials_profile}"
}

/* Creates a VPC, shared subnet, and gateway */
module "network" {
  source = "./modules/network"
}


module "proxy" {
  source        = "./modules/proxy"
  key_name      = "${var.rpc_proxy_key_name}" 
  region        = "${var.region}"
  dns_name      = "${var.dns_name}"
  vpc_id        = "${module.network.vpc_id}"
  subnet_id     = "${module.network.subnet_id}"
  instance_type = "t2.medium"
  #amis          = "${var.ami_map}"
}


module "blockchain" {
  source        = "./modules/blockchain"
  key_name      = "${var.blockchain_key_name}" 
  region        = "${var.region}"
  vpc_id        = "${module.network.vpc_id}"
  subnet_id     = "${module.network.subnet_id}"
  instance_type = "c4.xlarge"
  #amis          = "${var.ami_map}"
}


# might want a local-exec for this at some point: 
# ssh-keyscan -H {{ inventory_hostname }} >> ~/.ssh/known_hosts

/* Run the Ansible playbook for the blockchain node(s) 
resource "null_resource" "ansible_configure_blockchain" {
  depends_on = [
    "local_file.ansible_hosts"
  ]

  provisioner "local-exec" {
    working_dir = "${path.module}/../ansible"
    command = "ansible-playbook --vault-password-file ${path.module}/dump_to_txt.sh -i hosts -u ubuntu blockchain.yml -e \"proxy_hostname=${var.dns_name} data_disk=${module.blockchain.chain_data_volume}\""
  }
}
*/

resource "null_resource" "prod_tokens" {
  # Stages the prod tokens file for Ansible
  provisioner "local-exec" {
    working_dir = "${path.module}/../ansible/roles/ethrouter/files/"
    command     = "cp ${path.module}/../../src/config/tokens/production.json ."
  }
}

/* Run the Ansible playbook for the proxy node(s) 
resource "null_resource" "ansible_configure_proxy" {
  depends_on = [
    "local_file.ansible_hosts",
    "null_resource.prod_tokens",
    "modules.proxy.aws_eip_association.eip_assoc"
  ]

  provisioner "local-exec" {
    working_dir = "${path.module}/../ansible"
    command = "ansible-playbook --vault-password-file ${path.module}/dump_to_txt.sh -i hosts -u ubuntu proxy.yml -e \"ssl_hostname=${var.dns_name}\""
  }
}
*/
