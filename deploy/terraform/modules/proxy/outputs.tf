output "public_ip" {
  value = "${aws_instance.rpc_proxy.public_ip}"
}
