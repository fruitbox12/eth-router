variable "shared_credentials_file" { 
  default = "/Users/kyledunn/.aws/credentials" 
}

variable "shared_credentials_profile" { 
  default = "qs" 
}

variable "rpc_proxy_key_name" { 
  default = "dev-eth-full-node-us-east-2" 
}

variable "blockchain_key_name" { 
  default = "dev-eth-full-node-us-east-2" 
}

variable "region" {
  default = "us-east-2"
}

variable "dns_name" {
  default = "testnet.com"
}

variable "ami_map" {
  type = "map"
  default = {
    "us-west-2" = "ami-79873901"
    "us-east-1" = "ami-b374d5a5"
    "us-east-2" = "ami-82f4dae7"
  }
}
