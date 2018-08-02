output "eth_public_ip" {
  value = "${module.blockchain.public_ip}"
}

data "template_file" "ansible_hosts" {
  template = <<EOF
[blockchain]
${module.blockchain.public_ip}
EOF
}

resource "local_file" "ansible_hosts" {
    content     = "${data.template_file.ansible_hosts.rendered}"
    filename = "${path.module}/../ansible/hosts"
}
