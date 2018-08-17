# Terraform bootstrapping

## Getting started

`pip install pyyaml`
`export SOPS_KMS_ARN=arn:aws:kms:region:id:key/uuid`

Tell Ansible to not do strict host key checking, add this in your global config `~/.ansible.cfg`

```
[defaults]
host_key_checking = False
```

## Running Terraform

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

## AWS credentials

You will need to pass values for two variables for your environment.

1. `shared_credentials_file`
2. `shared_credentials_profile`

These can be passed in on the command line like so

`terraform plan -var 'shared_credentials_file=/Users/username/.aws/credentials' -var 'shared_credentials_profile=myprofile'`

Environment variables may also be used. They have a naming convention [documented upstream](https://www.terraform.io/docs/configuration/variables.html#environment-variables). The following is equivalent to above

```
$ export TF_VAR_shared_credentials_file=/Users/username/.aws/credentials \
         TF_VAR_shared_credentials_profile=myprofile
$ terraform plan
```

There is an example script at `variables-example.sh` which can be used as a template for customizing your environments. The `.gitignore` in this repo is configured to ignore files named `variables-production.sh` and `variables-staging.sh`. Any other filenames with secrets or private information could be accidently commited to the repo!

Run the customized script in-place `./variables-production.sh` and all your terraform commands from that shell will use those variables until you close the shell.