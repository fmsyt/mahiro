import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

const sheetsFsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

export {
  sheetsFsOptions
}
