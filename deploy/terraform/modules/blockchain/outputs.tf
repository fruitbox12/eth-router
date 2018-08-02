output "public_ip" {
  value = "${aws_instance.eth_node.public_ip}"
}
