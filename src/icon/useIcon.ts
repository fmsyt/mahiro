import { useEffect, useState } from "react";
import { iconsRoot } from "../path";

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

      const url = `http://localhost:17001/${iconsRoot}/${name}`;
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
