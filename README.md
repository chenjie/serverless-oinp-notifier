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

1. Search for `[Action required]` in `serverless.yml`, and change the `bucketName` to make it globally unique.

2. Since the `serverless-layers` plugin requires the deployment bucket pre-created, if you are deploying this app for the first time, you need to comment out the `plugins` section in `serverless.yml` and the `serverless-layers` section under `custom` section. After the first deployment, you can re-enable them and deploy the whole stack again to utilize layers.

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

## Extra notes and tips

### DynamoDB table design

- PK: webpage URL
- SK: a date-time string specified in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601)

It is designed this way to allow easy query for the latest record.

### Use lambda layers

You can use lambda layers to reduce the deployment package size from 45 MB to <100 KB. Checkout the `use-layers` branch of this repo.

### Successful deployment logs

```
$ sls deploy


Serverless: [ LayersPlugin ]: => default
... ○ Downloading ./package.json from bucket...
... ○ Comparing package.json dependencies...
... ○  Changes identified ! Re-installing...
... ∅ [warning] ".npmrc" file does not exists!
... ∅ [warning] "yarn.lock" file does not exists!
npm WARN oinp-notifier@0.0.1 No repository field.

added 75 packages from 74 contributors and audited 192 packages in 1.215s

3 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities


... ○ Created layer package /path/to/serverless-oinp-notifier/.serverless/oinp-notifier-dev-nodejs-default.zip (44.5 MB)
... ○ Uploading layer package...
... ○ OK...
... ○ New layer version published...
... ○ Uploading remote /path/to/serverless-oinp-notifier/package.json...
... ○ OK...
... ○ Adding layers...
... ✓ function.oinpNotifier - arn:aws:lambda:us-east-1:*********:oinp-notifier-dev-nodejs-default:5


Serverless: Packaging service...
Serverless: Installing dependencies for custom CloudFormation resources...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service oinp-notifier.zip file to S3 (20.64 KB)...
Serverless: Uploading custom CloudFormation resources...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...........
Serverless: Stack update finished...
Service Information
service: oinp-notifier
stage: dev
region: us-east-1
stack: oinp-notifier-dev
resources: 12
api keys:
  None
endpoints:
  None
functions:
  oinpNotifier: oinp-notifier-dev-oinpNotifier
layers:
  None


Serverless: [ LayersPlugin ]: => Layers Info
... ○ function.oinpNotifier = layers.arn:aws:lambda:us-east-1:*********:oinp-notifier-dev-nodejs-default:5


Serverless: Removing old service artifacts from S3...
```

## License

[MIT](LICENSE)
