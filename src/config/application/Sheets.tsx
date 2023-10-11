import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Pagination, Stack, TextField, Typography } from "@mui/material";
import { ConfigSheetProps } from "../../interface";
import fetchSheets from "../fetchSheets";

interface SheetPageProps {
  sheet: ConfigSheetProps;
  index: number;
  onSave?: (sheet: ConfigSheetProps) => void;
}

const SheetPage = (props: SheetPageProps) => {

    const { index, sheet: defaultSheet } = props;
    const [columns, setColumns] = useState(defaultSheet.columns);
    const [items, setItems] = useState(defaultSheet.items);

    const gridTemplateColumns = useMemo(() => `repeat(${columns}, 1fr)`, [columns]);
    const gridTemplateRows = useMemo(() => `repeat(${Math.ceil(items.length / columns)}, 1fr)`, [items, columns]);


    return (
      <Stack direction="column" gap={2} justifyContent="center" alignItems="start">
        <Button variant="contained">Save</Button>
        <TextField
          label="Columns"
          defaultValue={columns}
          variant="standard"
          inputProps={{ type: "number" }}
          onChange={(e) => setColumns(Number(e.target.value))}
          />

        <Box gap={2} sx={{ display: "grid", width: "100%", gridTemplateColumns, gridTemplateRows }}>
          {items.map((item, index) => (
            <Button
              key={index}
              variant="outlined"
              sx={{ textTransform: "none" }}
              disabled={item.disabled}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Stack>
    );
}


export default function Sheets() {

  const [sheets, setSheets] = useState<ConfigSheetProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);
  const [page, setPage] = useState(1);
  const pageIndex = page - 1;

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


          {sheets[pageIndex] && (
            <SheetPage
              sheet={sheets[pageIndex]}
              index={pageIndex}
              onSave={() => handleSave(sheets[pageIndex], pageIndex)}
              />
          )}

          <Stack justifyContent="center" alignItems="center">
            <Pagination
              count={sheets.length}
              onChange={(event, page) => setPage(page)}
              />
          </Stack>

        </>
      )}
    </Stack>
  );
}
