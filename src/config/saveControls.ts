import { fs } from "@tauri-apps/api";
import { ControlProps } from "../interface";

const saveControls = async (controls: ControlProps[]) => {
  const json = JSON.stringify(controls);
  await fs.writeFile("controls.json", json, { dir: fs.BaseDirectory.AppLocalData, append: false });
}

export default saveControls;
