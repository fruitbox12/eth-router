output "proxy_public_ip" {
  value = "${module.proxy.public_ip}"
}

output "eth_public_ip" {
  value = [
    "${values(module.blockchain.ports_and_public_ips)}"
  ]
}

data "template_file" "ansible_hosts" {
  template = <<EOF
[proxy]
${module.proxy.public_ip} ssl_hostname=${var.dns_name}
[blockchain]
${join("\n",
       formatlist("%s base_port=%s proxy_hostname=${var.dns_name} data_disk=${module.blockchain.chain_data_volume}",
                  values(module.blockchain.ports_and_public_ips),
                  keys(module.blockchain.ports_and_public_ips)
       )
  )}
EOF
}

resource "local_file" "ansible_hosts" {
    content     = "${data.template_file.ansible_hosts.rendered}"
    filename = "${path.module}/../ansible/hosts"
}
