import { useMemo } from "react";
import { Box } from "@mui/material";
import { PageProps } from "./interface";
import { Control } from "./Control";

const Page = (props: PageProps) => {

  const { emit, items, columns, disabled } = props;

  const gridTemplateColumns = useMemo(() => `repeat(${columns}, 1fr)`, [columns]);
  const gridTemplateRows = useMemo(() => `repeat(${Math.ceil(items.length / columns)}, 1fr)`, [items, columns]);

  return (
    <Box
      gap={2}
      alignItems="stretch"
      sx={{ display: "grid", height: "100%", gridTemplateColumns, gridTemplateRows }}
    >
      {items.map((control, i) => (
        <Control
          key={i}
          emit={emit || (() => {}) }
          sheetItem={control}
          disabled={disabled}
          />
      ))}

    </Box>
  );
};

export default Page;
