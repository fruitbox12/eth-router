output "public_ip" {
  value = "${aws_instance.eth_node.public_ip}"
}

output "chain_data_volume" {
  value = "${aws_volume_attachment.chain_data.device_name}"
}
