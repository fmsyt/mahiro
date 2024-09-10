import { } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { isTypeOfConfigControl } from "../interface";
import { CONTROLS_DIR } from "./controls";

const fetchControls = async () => {
  const isExists = await fs.exists("controls.json", {
    baseDir: CONTROLS_DIR
  });

  if (!isExists) {
    await fs.writeTextFile("controls.json", "[]", {
      baseDir: CONTROLS_DIR,
      append: false,
    });
  }

  const text = await fs.readTextFile("controls.json", {
    baseDir: CONTROLS_DIR
  });
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfConfigControl)) {
    return json;
  }

  return [];
}

export default fetchControls;
