variable "access_key" {}
variable "secret_key" {}
variable "key_name" {}
variable "region" {
  default = "us-west-2"
}
variable "zone_id" {
  default = "Z1P0T0PQYB133B"
}

variable "dns_name" {
  default = "rpc.blockchaindevlabs.com"
}

variable "amis" {
  type = "map"
  default = {
    "us-west-2" = "ami-79873901"
    "us-east-1" = "ami-b374d5a5"
  }
}
