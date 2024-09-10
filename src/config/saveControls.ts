import { } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { ConfigControlProps } from "../interface";
import { CONTROLS_DIR } from "./controls";

const saveControls = async (controls: ConfigControlProps[]) => {
  const json = JSON.stringify(controls);

  // NOTE: なぜか上書きするときに不正なフォーマットになるので、一度削除してから書き込む
  await fs.rename("controls.json", "controls.json.bak", {
    oldPathBaseDir: CONTROLS_DIR,
    newPathBaseDir: CONTROLS_DIR,
  });
  try {
    await fs.writeTextFile("controls.json", json, {
      baseDir: CONTROLS_DIR,
      append: false
    });
  } catch (error) {
    fs.copyFile("controls.json.bak", "controls.json", {
      fromPathBaseDir: CONTROLS_DIR,
      toPathBaseDir: CONTROLS_DIR
    });
    throw error;

  } finally {
    fs.remove("controls.json.bak", {
      baseDir: CONTROLS_DIR
    });
  }
}

export default saveControls;
