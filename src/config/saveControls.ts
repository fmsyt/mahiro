import { fs } from "@tauri-apps/api";
import { ConfigControlProps } from "../interface";

const saveControls = async (controls: ConfigControlProps[]) => {
  const json = JSON.stringify(controls);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.removeFile("controls.json", { dir: fs.BaseDirectory.AppLocalData });
  await fs.writeTextFile("controls.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
}

export default saveControls;
