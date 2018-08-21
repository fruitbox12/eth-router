export TF_VAR_shared_credentials_file="~/.aws/credentials" 
export TF_VAR_shared_credentials_profile="example-profile" 
export TF_VAR_rpc_proxy_key_name="example-key" 
export TF_VAR_blockchain_key_name="example-key" 
export TF_VAR_region="region"
export TF_VAR_dns_name="rpc.example.com"
# probably okay to keep these in here
export TF_VAR_ami_map='{ us-west-2 = "ami-79873901", us-east-1 = "ami-b374d5a5", us-east-2 = "ami-82f4dae7" }'
export SECRETS_PATH="$HOME/src/secrets"
