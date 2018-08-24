resource "aws_instance" "rpc_proxy" {
  ami           = "${lookup(var.amis, var.region)}"
  instance_type = "${var.instance_type}"
  key_name      = "${var.key_name}"

  vpc_security_group_ids = [
    "${aws_security_group.proxy_sg.id}"
  ]
  subnet_id = "${var.subnet_id}"

  tags {
    Name = "${var.working_environment}-rpc-proxy"
  }
}


resource "aws_eip" "ip" {
  instance                  = "${aws_instance.rpc_proxy.id}"
  associate_with_private_ip = "${aws_instance.rpc_proxy.private_ip}"
  vpc                       = true
}

/* Delay the remote-exec provisioner until the elastic IP is ready */
resource "aws_eip_association" "eip_assoc" {
  instance_id   = "${aws_instance.rpc_proxy.id}"
  allocation_id = "${aws_eip.ip.id}"

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y python"
    ]
    connection {
      host  = "${aws_eip.ip.public_ip}"
      type  = "ssh"
      user  = "ubuntu"
      agent = true
    }
  }
}


resource "aws_security_group" "proxy_sg" {
  name        = "${var.working_environment}_proxy_sg"
  description = "${var.working_environment} proxy security group"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [
      "10.0.0.0/16"
    ]
  }
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "icmp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  tags {
    Name = "${var.working_environment}-proxy-sg"
  }
}


#resource "aws_route53_zone" "selected" {
#  name   = "${var.dns_name}"
#  vpc_id = "${var.vpc_id}"
#}


resource "aws_route53_record" "rpc" {
  #zone_id = "${aws_route53_zone.selected.zone_id}"
  zone_id = "Z1P0T0PQYB133B"
  #name    = "${format("dev.%s", var.dns_name)}"
  name    = "${var.dns_name}"
  type    = "A"
  ttl     = "300"
  records = [
    "${aws_eip.ip.public_ip}"
  ]
}
