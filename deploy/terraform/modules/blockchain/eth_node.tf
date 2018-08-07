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


resource "aws_security_group" "dev-eth-node-sg" {
  name        = "dev-eth-node-sg"
  description = "Allow all inbound/outbound traffic"

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
