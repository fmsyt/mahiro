import { fs } from "@tauri-apps/api";
import { useEffect, useState } from "react";

const useIcon = (name?: string) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {

    let alive = false;

    const load = async () => {

      if (alive) {
        return;
      }

      alive = true;

      if (!name) {
        return;
      }

      const filepath = `icons/${name}`;

      const exists = await fs.exists(filepath, { dir: fs.BaseDirectory.AppCache });
      if (!exists) {
        return;
      }

      const url = await fs.readTextFile(filepath, { dir: fs.BaseDirectory.AppCache });
      console.log(url);
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
