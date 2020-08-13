# Serverless OINP Notifier

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

OINP stands for Ontario Immigrant Nominee Program. You can learn more about it [here](https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp).

This is a fully serverless application running on AWS. It leverages [AWS Free Tier](https://aws.amazon.com/free/) to send notifications whenever there is an update on the targeted OINP official webpage.

![Sample email notification](https://user-images.githubusercontent.com/25379724/90197012-6c029780-dd9b-11ea-8b93-d5b8aae16f9e.png)

## Features

1. Uses headless Chrome to render dynamic javascript content [[ref]()]
2. Checks for update every minute [[ref]()]
3. Ability to send notifications of type HTTP/HTTPS, SMS or Email [[ref]()]
4. Full-page [screenshot](https://user-images.githubusercontent.com/25379724/90196790-c64f2880-dd9a-11ea-96e0-b5fbf7cdf89c.png) is taken on each webpage update [[ref]()]

## A list of AWS services used in this app:

- Lambda
- CloudFormation
- S3
- DynamoDB
- CloudWatch
- EventBridge

## Estimated monthly cost

\$0 since everything is under "Always Free" type of AWS Free Tier

## Extra notes

### DynamoDB table design

- PK: webpage URL
- SK: a date-time string specified in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601)

It is designed this way to allow easy query for the latest record.
