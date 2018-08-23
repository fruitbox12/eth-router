#!/bin/bash
printf "Create initial S3 bucket to support shared state\n"
BUCKET_NAME="prod-rpc-terraform-state"

if [ -z ${AWS_PROFILE+x} ]; then
  printf "Need to set \$AWS_PROFILE to a valid profile\n"
  exit 1
else
  if [ -z ${TF_VAR_region+x} ]; then
    printf "Please set and source the env vars from variables-production.sh\n"
    exit 2
  else
    aws s3api create-bucket --acl private --bucket $BUCKET_NAME --region $TF_VAR_region --create-bucket-configuration LocationConstraint=$TF_VAR_region
    aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
  fi
fi
