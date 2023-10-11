import { fs } from "@tauri-apps/api";
import { isTypeOfSheet } from "../interface";
import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

const fsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

const fetchSheets = async () => {
  const isExists = await fs.exists("sheets.json", fsOptions);

  if (!isExists) {
    await fs.writeFile("sheets.json", "[]", fsOptions);
  }

  const text = await fs.readTextFile("sheets.json", fsOptions);
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfSheet)) {
    return json;
  }

  return [];
}

export default fetchSheets;
