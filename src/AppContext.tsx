import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect } from "react";
import { EmitTypes, isTypeOfPageProps, PageProps, ReceiveSheetUpdateMessage } from "./interface";
import WebSocketContext from "./WebSocketContext";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArrayOfPageProps(data: any): data is ReceiveSheetUpdateMessage["data"] {
  if (!Array.isArray(data)) {
    throw new Error("data is not array");
  }

  if (data.every(isTypeOfPageProps)) {
    return true;
  }

  return false;
}


interface AppContextProps {
  pages: PageProps[] | null;
  emit: (data: EmitTypes) => void;
  hostname?: string;
}

const AppContext = createContext<AppContextProps>({
  pages: null,
  emit: () => {},
});

interface AppContextProviderProps {
  children: React.ReactNode,
}


const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

  const { children } = props;
  const { lastJsonMessage, readyState, sendJsonMessage } = useContext(WebSocketContext);

  const [pages, setPages] = React.useState<PageProps[] | null>(null);

  const emit = useCallback((data: EmitTypes) => {
    sendJsonMessage({ method: "emit", data });
  }, [sendJsonMessage]);

  useEffect(() => {

    if (readyState !== WebSocket.OPEN) {
      return;
    }

    sendJsonMessage({ method: "general.update" });
    sendJsonMessage({ method: "sheets.update" });

  }, [readyState, sendJsonMessage])

  useLayoutEffect(() => {

    const method = lastJsonMessage?.method || "";

    switch (method) {
      case "sheets.update": {


        const list = lastJsonMessage?.data;
        if (!Array.isArray(list)) {
          return;
        }

        if (isArrayOfPageProps(list)) {
          console.log("sheets.update", lastJsonMessage?.data);
          setPages(list);
        }

        return;
      }

    }

  }, [lastJsonMessage]);

  const values = {
    pages,
    emit,
  }

  return (
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider };
