## Terraform to bootstrap an RPC proxy node

You will need three pieces of private information

1. AWS key ID for the region you want to start an instance
2. SSH key name in that region (you must have the private key locally)
3. AWS secret key for the region you want to start an instance

Terraform will prompt you for this information.

```
terraform init
terraform apply
terraform output ip
```
