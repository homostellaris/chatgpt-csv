import * as fs from "node:fs";
import yaml from "yaml";

export default function config() {
  const configFile = fs.readFileSync("./config.yml", "utf8");
  return yaml.parse(configFile);
}
