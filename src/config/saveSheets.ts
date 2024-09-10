import { } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { ConfigSheetProps } from "../interface";
import { SHEETS_DIR } from "./sheets";

const saveSheets = async (sheets: ConfigSheetProps[]) => {
  const json = JSON.stringify(sheets);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.rename("sheets.json", "sheets.json.bak", {
    oldPathBaseDir: SHEETS_DIR,
    newPathBaseDir: SHEETS_DIR
  });
  try {
    await fs.writeTextFile("sheets.json", json, {
      baseDir: SHEETS_DIR,
      append: false,
    });
  } catch (error) {
    fs.copyFile("sheets.json.bak", "sheets.json", {
      fromPathBaseDir: SHEETS_DIR,
      toPathBaseDir: SHEETS_DIR,
    });
    throw error;

  } finally {
    fs.remove("sheets.json.bak", {
      baseDir: SHEETS_DIR
    });
  }

}

export default saveSheets;
