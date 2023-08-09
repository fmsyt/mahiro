import React from "react";
import { pageProps } from "./interface";
import { useWebSocket } from "./webSocket";
import { Alert, Snackbar } from "@mui/material";

interface AppContextProps {
  webSocket: WebSocket | null,
  pages: pageProps[],
  uri: string | null,
  setUri: React.Dispatch<React.SetStateAction<string>>,
  hostname?: string,
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  pages: [],
  uri: null,
  setUri: () => {},
});

interface AppContextProviderProps {
  uri: string,
  children: React.ReactNode,
}

const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

    const { uri: defaultUri, children } = props;
    const [uri, setUri] = React.useState(defaultUri);
    const [hostname, setHostname] = React.useState<string | undefined>(undefined);

    const webSocket = useWebSocket(uri);

    const [open, setOpen] = React.useState(false);
    const [pages, setPages] = React.useState<pageProps[]>([]);

    React.useEffect(() => {
      if (!webSocket) return;

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

      webSocket?.addEventListener("message", handleMessage);

      return () => {
        webSocket?.removeEventListener("message", handleMessage);
      }
    }, [webSocket]);


    return (
      <AppContext.Provider value={{ webSocket, pages, uri, setUri, hostname }}>
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
