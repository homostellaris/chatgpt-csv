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

  const reference = records.map((record) => "- " + record.Qualities).join("\n");

  console.info(`🤖 Asking Chat-GPT to summarise`);
  const response = await chat(prompt, reference);

  return response;
}
