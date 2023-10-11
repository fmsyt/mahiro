import { fs } from "@tauri-apps/api";
import { isTypeOfControl } from "../interface";
import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

const fsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

const fetchControls = async () => {
  const isExists = await fs.exists("controls.json", fsOptions);

  if (!isExists) {
    await fs.writeFile("controls.json", "[]", fsOptions);
  }

  const text = await fs.readTextFile("controls.json", fsOptions);
  const json = JSON.parse(text);

  if (Array.isArray(json) && json.every(isTypeOfControl)) {
    return json;
  }

  return [];
}

export default fetchControls;
