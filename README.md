# Serverless OINP Notifier

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

OINP stands for Ontario Immigrant Nominee Program. You can learn more about it [here](https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp).

This is a fully serverless application running on AWS. It leverages [AWS Free Tier](https://aws.amazon.com/free/) to send notifications whenever there is an update on the targeted OINP official webpage.

![Sample email notification](https://user-images.githubusercontent.com/25379724/90197012-6c029780-dd9b-11ea-8b93-d5b8aae16f9e.png)

## Prerequisites

You will need the following packages properly installed in your local environment in order  to deploy this app.

| Name | Tested version(s) |
| --- | --- |
| [Git](https://git-scm.com/) | 2.17.0 |
| [Node.js](https://nodejs.org/) (with NPM) | node==12.16.3, npm==6.14.4 |
| [Serverless Framework](https://www.serverless.com/) | core==1.77.1, plugin==3.6.18, sdk==2.3.1, components==2.33.1 |
| [AWS CLI](https://aws.amazon.com/cli/) | aws-cli/2.0.16 Python/3.7.4 Darwin/18.7.0 botocore/2.0.0dev20 |

## Get started

```
git clone https://github.com/jellycsc/serverless-oinp-notifier.git
cd serverless-oinp-notifier/
npm i -g serverless
npm i
sls deploy
```

## Features

1. Uses headless Chrome to render dynamic javascript content [[ref](https://github.com/jellycsc/serverless-oinp-notifier/blob/master/index.js#L37-L43)]
2. Checks for update every minute [[ref](https://github.com/jellycsc/serverless-oinp-notifier/blob/master/serverless.yml#L50-L53)]
3. Ability to send notifications of type HTTP/HTTPS, SMS or Email [[ref](https://github.com/jellycsc/serverless-oinp-notifier/blob/master/serverless.yml#L100-L104)]
4. Full-page [screenshot](https://user-images.githubusercontent.com/25379724/90196790-c64f2880-dd9a-11ea-96e0-b5fbf7cdf89c.png) is taken on each webpage update [[ref](https://github.com/jellycsc/serverless-oinp-notifier/blob/master/index.js#L68-L69)]

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

## License

[MIT](LICENSE)
