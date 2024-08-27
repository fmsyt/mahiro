import { BaseDirectory, FsOptions } from "@tauri-apps/plugin-fs";

const sheetsFsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

export {
  sheetsFsOptions
}
