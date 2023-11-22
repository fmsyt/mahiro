import { fs } from "@tauri-apps/api";
import { isTypeOfConfigControl } from "../interface";
import { controlsFsOptions } from "./controls";

const fetchControls = async () => {
  const isExists = await fs.exists("controls.json", controlsFsOptions);

  if (!isExists) {
    await fs.writeFile("controls.json", "[]", controlsFsOptions);
  }

  const text = await fs.readTextFile("controls.json", controlsFsOptions);
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfConfigControl)) {
    return json;
  }

  return [];
}

export default fetchControls;
