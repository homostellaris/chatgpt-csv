import * as csv from "csv";
import * as fs from "node:fs";
import OpenAI from "openai";
import os from "os";

const headers = "Business Name,Review" + os.EOL;

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Initialize the parser
const parser = csv.parse({
  delimiter: ",",
});
// Use the readable stream api to consume records
parser.on("readable", async function () {
  let record;
  while ((record = parser.read()) !== null) {
    const review = await generateReview(record);
    writeStream.write(review + os.EOL);
  }
});
// Catch any error
parser.on("error", function (err) {
  console.error(err.message);
});
// Test that the parsed records matched the expected records
parser.on("end", function () {
  console.log("Stream ended");
  writeStream.end();
});
const writeStream = fs.createWriteStream("./test/output.csv");
writeStream.write(headers);
// Write data to the stream
parser.write(fs.readFileSync("./test/input-csvs/maryland-cookies.csv"));
// Close the readable stream
parser.end();

async function generateReview(record) {
  const review = "fake review";
  // const completion = await openai.chat.completions.create({
  //   messages: [{ role: "user", content: "Say this is a test" }],
  //   model: "gpt-3.5-turbo",
  // });

  return `Foo,${review}`;
}
