![Diagram](diagram.png)

[![Try with Postman](https://run.pstmn.io/button.svg)](https://www.getpostman.com/collections/6341f2799654255c9b1a)


# [AWS Serverless Application](https://aws.amazon.com/serverless/sam/) providing:

* An Amazon Cognito User Pool, with a custom workflow to provide a passwordless authentication flow using TokenChannel
* An Amazon Cognito User Pool Client, so we can start integrating the User Pool
* The Lambda functions that will be triggered during user pool authentication operations
* The lambda invocation permissions on the Lambda functions for the User Pool

## Requirements

* An [AWS account](https://aws.amazon.com/console/) and the credentials `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` available in the [environment](environment.env).
* A [TokenChannel.io account](https://tokenchannel.io) and the api key available in the [environment](environment.env).
* [Node.js](https://nodejs.org/en/download/)
* [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli)
* A bucket created in [AWS S3](https://s3.console.aws.amazon.com/s3/home) and its name set in [sam configuration file](samconfig.toml)

```bash
# Review and load the env variables. !!Hide credentials
export $(xargs < environment.env)

yarn install

# Packaging and deployment - 
npm run go

# Copy UserPoolClientId in the output - Will be needed for integration
```

## Introduction

Watch the [video introduction](https://youtu.be/_C5AmKfJTLo).

## Links

[Cognito Scenarios](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-scenarios.html)

[Cognito Custom Auth Flows with Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
