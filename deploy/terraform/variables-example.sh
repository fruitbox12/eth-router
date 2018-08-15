set -e
set -x
printf "This script will load an environment which you can use to bootstrap a new eth-router cluster\n"

me=`whoami`

export TF_shared_credentials_file="/Users/${me}/.aws/credentials" 
export TF_shared_credentials_profile="example-profile" 
export TF_rpc_proxy_key_name="example-key" 
export TF_blockchain_key_name="example-key" 
export TF_region="region"
export TF_dns_name="rpc.example.com"
# probably okay to keep these in here
export TF_ami_map='{ us-west-2 = "ami-79873901", us-east-1 = "ami-b374d5a5", us-east-2 = "ami-82f4dae7" }'
