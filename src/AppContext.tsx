import React from "react";
import { isTypeOfPageProps, pageProps } from "./interface";
import { Alert, Snackbar } from "@mui/material";
import { updateGeneral, updateSheets } from "./functions";
import { createWebSocket, defaultWebSocketConditions, webSocketConditionsTypes } from "./webSocket";


interface AppContextProps {
  webSocket: WebSocket | null,
  wsCloseCode: CloseEvent["code"] | null,
  reConnect: () => void,
  pages: pageProps[] | null,
  wsConditions: webSocketConditionsTypes,
  setWebSocketConditions: React.Dispatch<React.SetStateAction<webSocketConditionsTypes>>,
  hostname?: string,
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  wsCloseCode: null,
  wsConditions: defaultWebSocketConditions,
  reConnect: () => {},
  pages: null,
  setWebSocketConditions: () => {},
});

interface AppContextProviderProps {
  children: React.ReactNode,
}


const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

  const { children } = props;

  const [hostname, setHostname] = React.useState<string | undefined>(undefined);

  const [wsConditions, setWebSocketConditions] = React.useState<webSocketConditionsTypes>(defaultWebSocketConditions);
  const [wsCloseCode, setWsCloseCode] = React.useState<CloseEvent["code"] | null>(null);

  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState<pageProps[] | null>(null);

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
            if (Array.isArray(obj?.data)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const receivedPages = obj.data as Array<any>;
              receivedPages.every(isTypeOfPageProps) && setPages(receivedPages);
            }
            break;
        }
      }
      catch (e) {
        console.error(e);
        setOpen(true);
      }
    }

    const handleClose = (e: CloseEvent) => {
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
      setWebSocketConditions,

    }}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert severity="warning">不正なデータを受信しました。</Alert>
      </Snackbar>
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider };
