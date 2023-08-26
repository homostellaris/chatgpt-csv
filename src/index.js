import * as csv from "csv";
import * as fs from "node:fs";
import OpenAI from "openai";
import os from "os";

const headers = "Business Name,Review" + os.EOL;

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

const parser = csv.parse({
  delimiter: ",",
});

parser.on("readable", async function () {
  let record;
  while ((record = parser.read()) !== null) {
    const review = await generateReview(record);
    console.log(review);
    writeStream.write(review + os.EOL);
  }
});

parser.on("error", function (err) {
  console.error(err.message);
});

parser.on("end", function () {
  console.log("Stream ended");
  writeStream.end();
});

const writeStream = fs.createWriteStream("./test/output.csv");
writeStream.write(headers);

const files = fs.readdirSync("./test/input-csvs/");
for (let file of files) {
  if (file.includes(".csv")) {
    // Write data to the stream
    parser.write(fs.readFileSync("./test/input-csvs/" + file));
  }
}

parser.end();

async function generateReview(record) {
  const review = "fake review";

  // const completion = await openai.chat.completions.create({
  //   messages: [{ role: "user", content: "Say this is a test" }],
  //   model: "gpt-3.5-turbo",
  // });

  return `Foo,${review}`;
}
