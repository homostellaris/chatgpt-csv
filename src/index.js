import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import os from "os";
import yaml from "yaml";
import chat from "./chat.js";

const { input, output, prompt } = getConfig();

const writeStream = fs.createWriteStream(output.file);
writeStream.write(output.headers + os.EOL);

const inputFiles = fs.readdirSync(input.folder);
const inputCsvFiles = inputFiles.filter((file) => file.includes("csv"));
console.info(
  `🔍 Found ${inputFiles.length} files in input folder ${input.folder}; ${inputCsvFiles.length} are CSV files`
);

for (let file of inputCsvFiles) {
  console.info(`\n⏳ Processing input file ${file}`);
  await process(file);
}

writeStream.end();

function getConfig() {
  const configFile = fs.readFileSync("./config.yml", "utf-8");
  return yaml.parse(configFile);
}

async function process(file) {
  const records = parse(fs.readFileSync(input.folder + file), {
    delimiter: ",",
    columns: true,
  });
  console.info(`🗂️ Found ${records.length} records`);

  const reference = records.map((record) => "- " + record.Qualities).join("\n");

  console.info(`📞 Calling Chat-GPT`);
  const response = await chat(prompt, reference);

  console.info("📂 Writing result to output file");
  writeStream.write(`${file},"${response}"${os.EOL}`);
}
