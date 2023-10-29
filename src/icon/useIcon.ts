import { fs } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";
import { appCacheDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { useContext, useLayoutEffect, useState } from "react";
import { iconsRoot } from "../path";

import WebSocketContext from "../WebSocketContext";

interface useIconArgs {
  name?: string,
  origin?: { protocol?: "http" | "https", host?: string, port?: number },
}


const fromFs = async (name: string) => {

  if (!window.__TAURI_IPC__) {
    throw new Error("Tauri IPC not found");
  }

  const exists = await fs.exists(`${iconsRoot}/${name}`, { dir: BaseDirectory.AppCache });
  if (!exists) {
    return null;
  }

  const dir = await appCacheDir();
  const path = await join(dir, iconsRoot, name);
  const url = convertFileSrc(path);

  return url;
}


const useIcon = (name?: string, origin?: useIconArgs["origin"]) => {

  const [src, setSrc] = useState<string | null>(null);
  const { connection } = useContext(WebSocketContext);


  useLayoutEffect(() => {
    if (!name) {
      setSrc(null);
      return;
    }

    fromFs(name)
    .then(setSrc)
    .catch(() => {
      const protocol = origin?.protocol || connection.protocol === "ws" ? "http" : "https" ;
      const host = origin?.host || connection.hostname;
      const port = origin?.port || connection.port;

      const src = `${protocol}://${host}:${port}/${iconsRoot}/${name}`;
      setSrc(src);
    });

  }, [name, connection, origin?.host, origin?.port, origin?.protocol]);


  return src;
}

export default useIcon;
