import { BaseDirectory, FsOptions } from "@tauri-apps/plugin-fs";

const controlsFsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

export {
  controlsFsOptions
}
