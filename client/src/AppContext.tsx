import React from "react";
import { pageProps } from "./interface";
import { useWebSocket } from "./webSocket";

interface AppContextProps {
  webSocket: WebSocket | null,
  pages: pageProps[],
  uri: string | null,
  setUri: React.Dispatch<React.SetStateAction<string>>,
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

    const webSocket = useWebSocket(uri);

    const [pages, setPages] = React.useState<pageProps[]>([]);

    React.useEffect(() => {
      if (!webSocket) return;

      const handleMessage = (event: MessageEvent) => {

        try {
          const obj = JSON.parse(event.data);

          switch (obj?.method) {
            default: break;

            case "sheets.update":
              setPages(obj?.data);
              break;
          }
        }
        catch (e) {
          console.error(e);
        }
      }

      webSocket?.addEventListener("message", handleMessage);

      return () => {
        webSocket?.removeEventListener("message", handleMessage);
      }
    }, [webSocket]);


    return (
      <AppContext.Provider value={{ webSocket, pages, uri, setUri }}>
        {children}
      </AppContext.Provider>
    )
  }

export { AppContext, AppContextProvider };
