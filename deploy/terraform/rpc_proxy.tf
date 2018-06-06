provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region = "${var.region}"
}
resource "aws_instance" "rpc_proxy" {
  ami = "${lookup(var.amis, var.region)}"
  instance_type = "t2.micro"
  provisioner "local-exec" {
    command = "echo ${aws_instance.rpc_proxy.public_ip} > ip_address.txt"
  }
}

resource "aws_eip" "ip" {
  instance = "${aws_instance.rpc_proxy.id}"
}

output "ip" {
  value = "${aws_eip.ip.public_ip}"
}
