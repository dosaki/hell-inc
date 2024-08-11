terraform {
  backend "s3" {
    encrypt = true
    bucket = "tiago-websites-tf-state-files"
    region = "eu-west-1"
    key = "hell-inc.dosaki.net/terraform.tfstate"
  }
}
