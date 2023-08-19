import React from "react";
import { pageProps } from "./interface";
import { Alert, Snackbar, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { updateGeneral, updateSheets } from "./functions";
import { createWebSocket, defaultWebSocketConditions, webSocketConditionsTypes } from "./webSocket";




interface AppContextProps {
  webSocket: WebSocket | null,
  wsCloseCode: CloseEvent["code"] | null,
  reConnect: () => void,
  pages: pageProps[],
  wsConditions: webSocketConditionsTypes,
  themeMode: "light" | "dark" | "system",
  setThemeMode: (themeMode: "light" | "dark" | "system") => void,
  setWebSocketConditions: React.Dispatch<React.SetStateAction<webSocketConditionsTypes>>,
  hostname?: string,
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  wsCloseCode: null,
  wsConditions: defaultWebSocketConditions,
  reConnect: () => {},
  pages: [],
  themeMode: "system",
  setThemeMode: () => {},
  setWebSocketConditions: () => {},
});

interface AppContextProviderProps {
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

  const { children } = props;

  const [hostname, setHostname] = React.useState<string | undefined>(undefined);

  const [wsConditions, setWebSocketConditions] = React.useState<webSocketConditionsTypes>(defaultWebSocketConditions);
  const [wsCloseCode, setWsCloseCode] = React.useState<CloseEvent["code"] | null>(null);

  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState<pageProps[]>([]);

  const [webSocket, reConnect] = React.useMemo(() => {

    const webSocket = createWebSocket(wsConditions);

    const handleOpen = () => {
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

    const handleClose = (e: CloseEvent) => {
      console.log(e);
      setWsCloseCode(e.code);
    }

    const reConnect = () => {
      webSocket.close();
      setWebSocketConditions((prev) => ({ ...prev }));
    }

    webSocket.addEventListener("open", handleOpen);
    webSocket.addEventListener("message", handleMessage);
    webSocket.addEventListener("close", handleClose);

    return [webSocket, reConnect];

  }, [wsConditions]);


  return (
    <AppContext.Provider value={{
        webSocket,
        wsCloseCode,
        wsConditions,
        reConnect,
        pages,
        hostname,
        themeMode,
        setWebSocketConditions,
        setThemeMode: (themeMode: "light" | "dark" | "system") => {
          setThemeMode(themeMode);
          localStorage.setItem("themeMode", themeMode);
        },
      }}>
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
