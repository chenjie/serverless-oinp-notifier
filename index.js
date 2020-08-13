const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const chromium = require("chrome-aws-lambda");
const crypto = require("crypto");

// Get latest record from DynamoDB
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

// Lambda handler
exports.handler = async (event) => {
  // OINP updates webpage
  const url =
    "https://www.ontario.ca/page/2020-ontario-immigrant-nominee-program-updates";

  let browser = null;
  try {
    // Initialize headless Chrome
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // Go to URL and wait for it to be fully loaded
    const response = await page.goto(url, {
      waitUntil: "networkidle0",
    });
    const headers = response.headers();

    // Grab the inner text in the main content section which is then used to calculate an MD5 hash
    const mainContent = await page.evaluate(
      () => document.querySelector(".main-content").innerText
    );
    const md5 = crypto.createHash("md5").update(mainContent).digest("hex");
    console.log(md5);

    // Grab the latest record in the database and compare the hash to see if there are any new updates
    const latestItem = await getLatestDdbItem(url);
    if (latestItem && latestItem.ContentMd5 === md5) {
      console.log(`ContentMd5 didn't change, skip`);
      return;
    }

    console.log(mainContent);

    // If there is an update, take a full-page screenshot and store it in S3
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

    // Insert a record into ddb with the new MD5 hash
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

    // Notify us by publishing a message to SNS
    await sns
      .publish({
        TopicArn: process.env.OINP_TOPIC_ARN,
        Subject: "OINP website has been updated",
        Message: url,
      })
      .promise();
  } finally {
    // Always close the browser even if there are any exceptions occurred in the try block
    if (browser !== null) {
      await browser.close();
    }
  }

  return;
};
