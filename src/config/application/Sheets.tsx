import { useCallback, useEffect, useState } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { ConfigSheetProps } from "../../interface";
import fetchSheets from "../fetchSheets";

export default function Sheets() {

  const [sheets, setSheets] = useState<ConfigSheetProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);

  useEffect(() => {

    const read = async () => {

      try {
        const controls = await fetchSheets();
        setSheets(controls);

      } catch (error) {
        console.error(error);
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  const handleSave = useCallback((control: ConfigSheetProps, index: number) => {

    const newControls = [...sheets!];
    newControls[index] = control;

    // saveControls(newControls).then(() => {
    //   setSheets(newControls);
    // });

  }, [sheets]);

  return (
    <Stack>
      <Typography variant="h5">Sheets</Typography>

      {sheets == null ? (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {invalidJson && (
            <Typography variant="body1">
              Invalid JSON in controls.json
            </Typography>
          )}
          {sheets.map((sheet, index) => (
            <div>
              <pre>{JSON.stringify(sheet, null, 2)}</pre>
            </div>
          ))}
        </>
      )}
    </Stack>
  );
}
