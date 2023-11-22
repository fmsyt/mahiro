import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

const controlsFsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

export {
  controlsFsOptions
}
