import React from "react";
import { pageProps } from "./interface";
import { useWebSocket } from "./webSocket";
import { Alert, Snackbar, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { updateGeneral, updateSheets } from "./functions";

interface AppContextProps {
  webSocket: WebSocket | null,
  pages: pageProps[],
  themeMode: "light" | "dark" | "system",
  setThemeMode: (themeMode: "light" | "dark" | "system") => void,
  uri: string | null,
  setUri: React.Dispatch<React.SetStateAction<string>>,
  hostname?: string,
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  pages: [],
  themeMode: "system",
  uri: null,
  setUri: () => {},
  setThemeMode: () => {},
});

interface AppContextProviderProps {
  uri: string,
  children: React.ReactNode,
}

const initialThemeMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;

const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "system">(initialThemeMode || "system");

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: themeMode === "system" ? (prefersDarkMode ? "dark" : "light") : themeMode,
    }
  }), [prefersDarkMode, themeMode]);

  const { uri: defaultUri, children } = props;
  const [uri, setUri] = React.useState(defaultUri);
  const [hostname, setHostname] = React.useState<string | undefined>(undefined);

  const webSocket = useWebSocket(uri);

  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState<pageProps[]>([]);

  React.useEffect(() => {
    if (!webSocket) return;

    const handleOpen = () => {
      localStorage.setItem("connectTo", uri);

      updateGeneral(webSocket);
      updateSheets(webSocket);
    }

    const handleMessage = (event: MessageEvent) => {

      try {
        const obj = JSON.parse(event.data);

        switch (obj?.method) {
          default: break;

          case "general.update":
            setHostname(obj?.data?.hostname);
            break;

          case "sheets.update":
            setPages(obj?.data);
            break;
        }
      }
      catch (e) {
        console.error(e);
        setOpen(true);
      }
    }

    webSocket?.addEventListener("open", handleOpen);
    webSocket?.addEventListener("message", handleMessage);

    return () => {
      webSocket?.removeEventListener("message", handleMessage);
    }
  }, [webSocket, uri]);

  const value = {
    webSocket,
    pages,
    uri,
    setUri,
    hostname,
    themeMode,
    setThemeMode: (themeMode: "light" | "dark" | "system") => {
      setThemeMode(themeMode);
      localStorage.setItem("themeMode", themeMode);
    },
  }

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}

        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
        >
          <Alert severity="warning">不正なデータを受信しました。</Alert>
        </Snackbar>
      </ThemeProvider>
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider };
