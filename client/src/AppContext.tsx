import React from "react";
import { pageProps } from "./interface";
import { useWebSocket } from "./webSocket";

interface AppContextProps {
  webSocket: WebSocket | null,
  pages: pageProps[],
}

const AppContext = React.createContext<AppContextProps>({
  webSocket: null,
  pages: [],
});


interface AppContextProviderProps {
  uri: string,
  children: React.ReactNode,
}

const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

    const { uri, children } = props;
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
      <AppContext.Provider value={{ webSocket, pages }}>
        {children}
      </AppContext.Provider>
    )
  }

export { AppContext, AppContextProvider };
