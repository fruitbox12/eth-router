provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region = "${var.region}"
}
resource "aws_instance" "rpc_proxy" {
  ami = "${lookup(var.amis, var.region)}"
  instance_type = "t2.micro"
  security_groups = ["allow_all"]
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
}

resource "aws_eip" "ip" {
  instance = "${aws_instance.rpc_proxy.id}"
}

output "ip" {
  value = "${aws_eip.ip.public_ip}"
}

resource "aws_security_group" "allow_all" {
  name        = "allow_all"
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
    Name = "allow_all"
  }
}

resource "aws_route53_record" "rpc" {
  zone_id = "${var.zone_id}"
  name    = "${var.dns_name}"
  type    = "A"
  ttl     = "300"
  records = ["${aws_eip.ip.public_ip}"]
}
