## Terraform to bootstrap an RPC proxy node

You will need three pieces of private information

1. AWS key ID for the region you want to start an instance
2. SSH key name in that region (you must have the private key locally)
3. AWS secret key for the region you want to start an instance

You will also need to provide the Route53 Zone ID so Terraform knows how to create the DNS name you specify in `variables.tf`. This information is not secret but it varies for each installation.

Terraform will prompt you for the secret information.

```
terraform init
terraform apply
terraform output ip
```

After the instance is up, ping the specified DNS name to check availablity. If it's online, proceed to configure and run the Ansible playbooks.