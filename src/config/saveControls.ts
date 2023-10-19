import { fs } from "@tauri-apps/api";
import { ConfigControlProps } from "../interface";

const saveControls = async (controls: ConfigControlProps[]) => {
  const json = JSON.stringify(controls);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.renameFile("controls.json", "controls.json.bak", { dir: fs.BaseDirectory.AppLocalData });
  try {
    await fs.writeTextFile("controls.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
  } catch (error) {
    fs.copyFile("controls.json.bak", "controls.json", { dir: fs.BaseDirectory.AppLocalData });
    throw error;

  } finally {
    fs.removeFile("controls.json.bak", { dir: fs.BaseDirectory.AppLocalData });
  }
}

export default saveControls;
