import { fs } from "@tauri-apps/api";
import { ConfigControlProps } from "../interface";

const saveControls = async (controls: ConfigControlProps[]) => {
  const json = JSON.stringify(controls);
  await fs.writeFile("controls.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
}

export default saveControls;
