import { parse, stringify, transform } from "csv";
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

const readStream = fs.createReadStream(input.master.file);
const writeStream = fs.createWriteStream(output.file);
const transformer = transform({ parallel: 1 }, (record, callback) => {
  console.info(`\n⏳ Processing record from input file`);
  if (record[output.column]) {
    console.info("⏩ Column already populated for record; skipping.");
    return callback(null, record);
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
    return callback(null, record);
  }
  console.info(
    `🔍 Summary data file '${summaryDataFile}' found for pattern '${pattern}'`
  );

  summarise(summaryDataFile).then((summary) => {
    console.info("📂 Summary ready, writing populated record to output file");
    const populatedRecord = { ...record, [output.column]: summary };
    callback(null, populatedRecord);
  });
});

readStream
  .pipe(parser)
  .pipe(transformer)
  .pipe(
    stringify({
      header: true,
    })
  )
  .pipe(writeStream);
