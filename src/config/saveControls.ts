import { fs } from "@tauri-apps/api";
import { ConfigControlProps } from "../interface";
import { controlsFsOptions } from "./controls";

const saveControls = async (controls: ConfigControlProps[]) => {
  const json = JSON.stringify(controls);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.renameFile("controls.json", "controls.json.bak", controlsFsOptions);
  try {
    await fs.writeTextFile("controls.json", json, { ...controlsFsOptions, append: false });
  } catch (error) {
    fs.copyFile("controls.json.bak", "controls.json", controlsFsOptions);
    throw error;

  } finally {
    fs.removeFile("controls.json.bak", controlsFsOptions);
  }
}

export default saveControls;
