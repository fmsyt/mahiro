import { fs } from "@tauri-apps/api";
import { isTypeOfSheet } from "../interface";
import { sheetsFsOptions } from "./sheets";

const fetchSheets = async () => {
  const isExists = await fs.exists("sheets.json", sheetsFsOptions);

  if (!isExists) {
    await fs.writeFile("sheets.json", "[]", sheetsFsOptions);
  }

  const text = await fs.readTextFile("sheets.json", sheetsFsOptions);
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfSheet)) {
    return json;
  }

  return [];
}

export default fetchSheets;
