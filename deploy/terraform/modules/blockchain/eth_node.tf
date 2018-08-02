provider "aws" {
  region = "${var.region}"
  shared_credentials_file = "${var.shared_credentials_file}"
  profile                 = "${var.shared_credentials_profile}"
}

#"c4.xlarge"
resource "aws_instance" "eth_node" {
  ami = "${lookup(var.amis, var.region)}"
  instance_type = "t2.micro" 
  security_groups = ["dev-eth-node-sg"]
  key_name = "${var.key_name}"
  provisioner "remote-exec" {
    inline = ["sudo apt-get update",
              "sudo apt-get install -y python"
    ]
    connection {
      type = "ssh"
      user = "ubuntu"
      agent = true
    }
  }

  # We set the name as a tag
  tags {
    "Name" = "dev-eth-node"
  }
}

#resource "aws_eip" "ip" {
#  instance = "${aws_instance.rpc_proxy.id}"
#}
#
#output "ip" {
#  value = "${aws_eip.ip.public_ip}"
#}

resource "aws_security_group" "dev-eth-node-sg" {
  name        = "dev-eth-node-sg"
  description = "Allow all inbound traffic"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  tags {
    Name = "dev-eth-node-sg"
  }
}

#resource "aws_route53_record" "rpc" {
#  zone_id = "${var.zone_id}"
#  name    = "${var.dns_name}"
#  type    = "A"
#  ttl     = "300"
#  records = ["${aws_eip.ip.public_ip}"]
#}
