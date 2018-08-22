output "ports_and_public_ips" {
  value = "${zipmap(
    aws_instance.eth_node.*.tags.base_port,
    aws_instance.eth_node.*.public_ip
  )}"
}

variable "volume_name_map" {
  type = "map"
  default = {
    "c4.xlarge" = "/dev/xvdg"
    "r5.xlarge" = "/dev/nvme1n1"
  }
}

output "chain_data_volume" {
  #value = "${aws_volume_attachment.chain_data.device_name}"
  # TODO - avoid relying on all instance types being the same
  value = "${lookup(var.volume_name_map, aws_instance.eth_node.0.instance_type)}"
}
