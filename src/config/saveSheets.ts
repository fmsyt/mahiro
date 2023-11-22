import { fs } from "@tauri-apps/api";
import { ConfigSheetProps } from "../interface";
import { sheetsFsOptions } from "./sheets";

const saveSheets = async (sheets: ConfigSheetProps[]) => {
  const json = JSON.stringify(sheets);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.renameFile("sheets.json", "sheets.json.bak", sheetsFsOptions);
  try {
    await fs.writeTextFile("sheets.json", json, { ...sheetsFsOptions, append: false });
  } catch (error) {
    fs.copyFile("sheets.json.bak", "sheets.json", sheetsFsOptions);
    throw error;

  } finally {
    fs.removeFile("sheets.json.bak", sheetsFsOptions);
  }

}

export default saveSheets;
