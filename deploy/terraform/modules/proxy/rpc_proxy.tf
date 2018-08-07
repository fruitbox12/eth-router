resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags {
    Name = "dev-rpc-vpc"
  }
}


resource "aws_internet_gateway" "main" {
    vpc_id = "${aws_vpc.main.id}"
}


resource "aws_subnet" "public" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags {
    Name = "dev-rpc-subnet-public"
  }
}


resource "aws_subnet" "private" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "10.0.2.0/24"
  map_public_ip_on_launch = false

  tags {
    Name = "dev-rpc-subnet-private"
  }
}


resource "aws_nat_gateway" "main" {
  allocation_id = "${aws_eip.ip.id}"
  subnet_id     = "${aws_subnet.public.id}"
}


resource "aws_security_group" "proxy_sg" {
  name        = "dev_proxy_sg"
  description = "Dev proxy security group"
  vpc_id = "${aws_vpc.main.id}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
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
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  tags {
    Name = "dev-proxy-sg"
  }
}


resource "aws_instance" "rpc_proxy" {
  ami = "${lookup(var.amis, var.region)}"
  instance_type = "t2.micro"
  key_name = "${var.key_name}"

  vpc_security_group_ids = [
    "${aws_security_group.proxy_sg.id}"
  ]
  subnet_id = "${aws_subnet.public.id}"
  #associate_public_ip_address = true

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

  tags {
    Name = "dev-rpc-proxy"
  }
}


resource "aws_eip" "ip" {
  instance = "${aws_instance.rpc_proxy.id}"
  #vpc = true
}


#resource "aws_eip_association" "eip_assoc" {
#  instance_id   = "${aws_instance.rpc_proxy.id}"
#  allocation_id = "${aws_eip.ip.id}"
#
#  provisioner "remote-exec" {
#    inline = ["sudo apt-get update",
#              "sudo apt-get install -y python"
#    ]
#    connection {
#      host = "${aws_eip.ip.public_ip}"
#      type = "ssh"
#      user = "ubuntu"
#      agent = true
#    }
#  }
#}


/* Routing table for private subnet */
resource "aws_route_table" "private" {
  vpc_id = "${aws_vpc.main.id}"

  tags {
    Name        = "dev-private-route-table"
    #Environment = "${var.environment}"
  }
}

/* Routing table for public subnet */
resource "aws_route_table" "public" {
  vpc_id = "${aws_vpc.main.id}"

  tags {
    Name        = "dev-public-route-table"
    #Environment = "${var.environment}"
  }
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = "${aws_route_table.public.id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.main.id}"
}

resource "aws_route" "private_nat_gateway" {
  route_table_id         = "${aws_route_table.private.id}"
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = "${aws_nat_gateway.main.id}"
}

/* Route table associations */
resource "aws_route_table_association" "public" {
  subnet_id      = "${aws_subnet.public.id}"
  route_table_id = "${aws_route_table.public.id}"
}

resource "aws_route_table_association" "private" {
  subnet_id       = "${aws_subnet.private.id}"
  route_table_id  = "${aws_route_table.private.id}"
}


resource "aws_route53_zone" "selected" {
  name         = "${var.dns_name}"
  #private_zone = true
  vpc_id       = "${aws_vpc.main.id}"
}


resource "aws_route53_record" "rpc" {
  zone_id = "${aws_route53_zone.selected.zone_id}"
  name    = "${format("dev.%s", var.dns_name)}"
  type    = "A"
  ttl     = "300"
  records = ["${aws_eip.ip.public_ip}"]
}
