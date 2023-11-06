import { useLayoutEffect, useState } from "react";
import { Container, Stack, Typography } from "@mui/material";
import { path } from "@tauri-apps/api";

const Path = () => {

  const [pathList, setPathList] = useState<{ key: string, path: string }[]>([]);

  useLayoutEffect(() => {

    const func = async () => {

      const promiseMap = {
        appDataDir: path.appDataDir(),
        appLocalDataDir: path.appLocalDataDir(),
        localDataDir: path.localDataDir(),
        configDir: path.configDir(),
        appConfigDir: path.appConfigDir(),
      }

      const result = await Promise.all(Object.values(promiseMap));
      setPathList(Object.keys(promiseMap).map((key, index) => ({
        key,
        path: result[index].toString()
      })));

    }


    func();

  }, []);

  return (
    <Container>
      <Stack gap={2}>
        <Typography variant="h5">パス</Typography>
        <pre>{ JSON.stringify(pathList, null, 2) }</pre>
      </Stack>
    </Container>
  );
}

export default Path;
