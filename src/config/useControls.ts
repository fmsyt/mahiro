import { useEffect, useState } from "react";
import { ConfigControlProps } from "../interface";
import fetchControls from "./fetchControls";

const useControls = () => {
  const [controls, setControls] = useState<ConfigControlProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);

  useEffect(() => {

    const read = async () => {

      try {
        const controls = await fetchControls();
        setControls(controls);

      } catch (error) {
        console.error(error);
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  return { controls, invalidJson };
}

export default useControls;
