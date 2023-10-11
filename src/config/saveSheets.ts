import { fs } from "@tauri-apps/api";
import { ConfigSheetProps } from "../interface";

const saveSheets = async (sheets: ConfigSheetProps[]) => {
  const json = JSON.stringify(sheets);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.removeFile("sheets.json", { dir: fs.BaseDirectory.AppLocalData });
  await fs.writeTextFile("sheets.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
}

export default saveSheets;
