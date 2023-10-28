import { BaseDirectory, appCacheDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from '@tauri-apps/api/tauri';

import { useEffect, useState } from "react";
import { iconsRoot } from "../path";
import { fs } from "@tauri-apps/api";

const useIcon = (name?: string) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {

    let alive = false;

    if (!name) {
      setSrc(null);
      return;
    }

    const load = async () => {

      if (alive) {
        return;
      }

      const exists = await fs.exists(`${iconsRoot}/${name}`, { dir: BaseDirectory.AppCache });
      if (!exists) {
        setSrc(null);
        return;
      }

      const dir = await appCacheDir();
      const path = await join(dir, iconsRoot, name);
      const url = convertFileSrc(path);

      import.meta.env.DEV && console.log('URL', url);

      setSrc(url);
    }

    load();

    return () => {
      alive = false;
    }

  }, [name]);

  return src;
}

export default useIcon;
