const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const chromium = require("chrome-aws-lambda");
const crypto = require("crypto");

async function getLatestDdbItem(url) {
  const { Items: items } = await ddb
    .query({
      TableName: process.env.DDB_TABLE_NAME,
      KeyConditionExpression: "PK = :url",
      ExpressionAttributeValues: {
        ":url": url,
      },
      Limit: 1,
      ScanIndexForward: false,
    })
    .promise();
  if (items.length === 0) {
    return null;
  }
  return items[0];
}

exports.handler = async (event) => {
  let browser = null;

  const url =
    event.url ||
    "https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates";

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const response = await page.goto(url, {
      waitUntil: "networkidle0",
    });
    const headers = response.headers();

    const mainContent = await page.evaluate(
      () => document.querySelector(".main-content").innerText
    );
    const md5 = crypto.createHash("md5").update(mainContent).digest("hex");
    console.log(md5);

    const latestItem = await getLatestDdbItem(url);
    if (latestItem && latestItem.ContentMd5 === md5) {
      console.log(`ContentMd5 didn't change, skip`);
      return;
    }

    console.log(mainContent);

    const imageBuffer = await page.screenshot({ fullPage: true });
    const s3Key = uuidv4();

    await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: "image/png",
      })
      .promise();

    await ddb
      .put({
        TableName: process.env.DDB_TABLE_NAME,
        Item: {
          PK: url,
          SK: new Date().toISOString(),
          ResponseHeaders: headers,
          S3Key: s3Key,
          ContentMd5: md5,
        },
      })
      .promise();

    await sns
      .publish({
        TopicArn: process.env.OINP_TOPIC_ARN,
        Subject: "OINP website has been updated",
        Message: url,
      })
      .promise();
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return;
};
