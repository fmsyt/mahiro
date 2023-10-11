import { fs } from "@tauri-apps/api";
import { ConfigSheetProps } from "../interface";

const saveSheets = async (controls: ConfigSheetProps[]) => {
  const json = JSON.stringify(controls);
  await fs.writeFile("sheets.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
}

export default saveSheets;
