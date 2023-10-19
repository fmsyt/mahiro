import { fs } from "@tauri-apps/api";
import { ConfigSheetProps } from "../interface";

const saveSheets = async (sheets: ConfigSheetProps[]) => {
  const json = JSON.stringify(sheets);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.renameFile("sheets.json", "sheets.json.bak", { dir: fs.BaseDirectory.AppLocalData });
  try {
    await fs.writeTextFile("sheets.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
  } catch (error) {
    fs.copyFile("sheets.json.bak", "sheets.json", { dir: fs.BaseDirectory.AppLocalData });
    throw error;

  } finally {
    fs.removeFile("sheets.json.bak", { dir: fs.BaseDirectory.AppLocalData });
  }

}

export default saveSheets;
