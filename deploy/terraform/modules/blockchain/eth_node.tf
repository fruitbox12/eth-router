resource "aws_instance" "eth_node" {
  count         = "${var.num_nodes}"
  ami           = "${lookup(var.amis, var.region)}"
  instance_type = "${var.instance_type}" 
  key_name      = "${var.key_name}"

  vpc_security_group_ids = [
    "${aws_security_group.eth_node_sg.id}"
  ]
  subnet_id = "${var.subnet_id}"

  associate_public_ip_address = true

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y python"
    ]
    connection {
      type  = "ssh"
      user  = "ubuntu"
      agent = true
    }
  }

  tags {
    "Name" = "dev-eth-node-${count.index}"
    "base_port"  = "${(count.index + 8) * 1000}"
  }
}


resource "aws_volume_attachment" "chain_data" {
  count       = "${var.num_nodes}"
  device_name = "/dev/xvdg"
  volume_id   = "${element(aws_ebs_volume.chain_data.*.id, count.index)}"
  instance_id = "${element(aws_instance.eth_node.*.id, count.index)}"
}


resource "aws_ebs_volume" "chain_data" {
  count             = "${var.num_nodes}"
  availability_zone = "${element(aws_instance.eth_node.*.availability_zone, count.index)}"

  # Size in GiB
  size              = 1000

  tags {
    "Name" = "dev-eth-node-chaindata"
  }
}


resource "aws_security_group" "eth_node_sg" {
  name        = "eth-node-sg"
  description = "Allow inbound/outbound traffic"
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
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  tags {
    Name = "eth-node-sg"
  }
}
