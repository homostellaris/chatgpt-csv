import { parse } from "csv";
import { stringify } from "csv-stringify/sync";
import * as fs from "node:fs";

import config from "./config.js";
import summarise from "./summarise.js";

const { input, output } = config();

const inputFiles = fs.readdirSync(input.summaryData.folder);
const inputCsvFiles = inputFiles.filter((file) => file.includes("csv"));
console.info(
  `🔍 Found ${inputFiles.length} files in input folder ${input.summaryData.folder}; ${inputCsvFiles.length} are CSV files`
);

const parser = parse({
  bom: true,
  columns: true,
  encoding: "utf8",
  delimiter: ",",
  relaxQuotes: true,
});

parser.on("readable", async function () {
  let record;
  while ((record = parser.read()) !== null) {
    console.info(`\n⏳ Processing record from input file`);
    if (record[output.column]) {
      console.info("⏩ Column already populated for record; skipping.");
      continue;
    }

    const pattern = input.master.summaryMatchColumns
      .map((summaryMatchColumn) => record[summaryMatchColumn])
      .join(".*");
    const summaryDataFile = inputCsvFiles.find((file) =>
      file.match(new RegExp(pattern))
    );
    if (!summaryDataFile) {
      console.warn(
        `⏩ No summary data file found for pattern ${pattern}; skipping.`
      );
      continue;
    } else {
      console.info(
        `🔍 Summary data file '${summaryDataFile}' found for pattern '${pattern}'`
      );
    }

    const summary = await summarise(summaryDataFile);
    const populatedRecord = { ...record, [output.column]: summary };

    console.info("📂 Writing populated record to output file");
    writeStream.write(stringify([populatedRecord]));
  }
});

parser.on("error", function (err) {
  console.error(err.message);
});

parser.on("end", function () {
  console.log("Stream ended");
  writeStream.end();
});

const writeStream = fs.createWriteStream(output.file);
const readStream = fs.createReadStream(input.master.file);
readStream.pipe(parser);
