import React from "react";
import { pageProps } from "./interface";
import { Alert, Snackbar, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { updateGeneral, updateSheets } from "./functions";

interface webSocketConditionsTypes {
  protocol: "ws" | "wss",
  hostname: string,
  port?: number,
  token?: string | null,
}

const defaultProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const defaultPort = import.meta.env.MODE === "production" ? window.location.port : "8000";
const defaultWebSocketToken = localStorage.getItem("wsToken");

const defaultWebSocketConditions: webSocketConditionsTypes = {
  protocol: defaultProtocol as "ws" | "wss",
  hostname: window.location.hostname,
  port: parseInt(defaultPort),
  token: defaultWebSocketToken,
}

interface AppContextProps {
  webSocket: WebSocket | null,
  wsCloseCode: CloseEvent["code"] | null,
  pages: pageProps[],
  wsConditions: webSocketConditionsTypes,
  uri: string | null,
  themeMode: "light" | "dark" | "system",
  setThemeMode: (themeMode: "light" | "dark" | "system") => void,
  createWebSocket: (conditions: webSocketConditionsTypes) => void,
  hostname?: string,
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  wsCloseCode: null,
  wsConditions: defaultWebSocketConditions,
  uri: null,
  pages: [],
  themeMode: "system",
  setThemeMode: () => {},
  createWebSocket: () => {},
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

  const createWebSocket = React.useCallback((conditions: webSocketConditionsTypes) => {
    setWebSocketConditions(conditions);
  }, []);

  const webSocket = React.useMemo(() => {
    const { protocol, hostname, port, token } = wsConditions;

    const urlString = `${protocol}://${hostname}${port ? `:${port}` : ""}/ws${token ? `?token=${token}` : ""}`;
    const webSocket = new WebSocket(urlString);

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

    webSocket.addEventListener("open", handleOpen);
    webSocket.addEventListener("message", handleMessage);
    webSocket.addEventListener("close", handleClose);

    return webSocket;

  }, [wsConditions]);


  return (
    <AppContext.Provider value={{
        webSocket,
        wsCloseCode,
        pages,
        wsConditions,
        uri: "",
        hostname,
        themeMode,
        createWebSocket,
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
