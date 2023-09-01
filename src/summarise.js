import { parse } from "csv-parse/sync";
import * as fs from "node:fs";

import chat from "./chat.js";
import config from "./config.js";

const { input, prompt } = config();

export default async function summarise(file) {
  const records = parse(fs.readFileSync(input.summaryData.folder + file), {
    bom: true,
    columns: true,
    delimiter: ",",
    relaxQuotes: true,
  });
  console.info(`🗂️ Found ${records.length} records`);

  const contextRecords = records
    .filter((record) => record[input.summaryData.column])
    .map((record) => "- " + record[input.summaryData.column]);
  console.info(
    `✂︎ Filtered reviews with no text, keeping ${contextRecords.length}/${records.length}`
  );
  let context = "";

  let i = 0;
  while (i < contextRecords.length) {
    const nextContextRecord = contextRecords[++i] + "\n";
    if ((context.length + nextContextRecord.length) / 4 >= requestTokenLimit) {
      console.info(
        `✂︎ Too many reviews to summarise in one request, using ${i}/${contextRecords.length} reviews for summary.`
      );
      break;
    }
    context += nextContextRecord;
  }

  console.info(`🤖 Asking Chat-GPT to summarise`);
  const response = await chat(prompt, context);

  return response;
}

const requestTokenLimit = 4097;
