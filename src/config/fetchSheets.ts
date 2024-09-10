import { } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { isTypeOfSheet } from "../interface";
import { SHEETS_DIR } from "./sheets";

const fetchSheets = async () => {
  const isExists = await fs.exists("sheets.json", {
    baseDir: SHEETS_DIR
  });

  if (!isExists) {
    await fs.writeTextFile("sheets.json", "[]", {
      baseDir: SHEETS_DIR,
      append: false,
    });
  }

  const text = await fs.readTextFile("sheets.json", {
    baseDir: SHEETS_DIR
  });
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfSheet)) {
    return json;
  }

  return [];
}

export default fetchSheets;
