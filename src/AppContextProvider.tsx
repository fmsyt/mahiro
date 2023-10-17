import React, { useContext, useEffect, useLayoutEffect } from "react";
import { EmitTypes, isTypeOfReceiveSheetUpdateMessage, PageProps } from "./interface";

import AppContext from "./AppContext";
import WebSocketContext from "./WebSocketContext";

interface AppContextProviderProps {
  children: React.ReactNode,
}

const AppContextProvider: React.FC<AppContextProviderProps> = (props) => {

  const { children } = props;
  const { lastJsonMessage, readyState, sendJsonMessage } = useContext(WebSocketContext);

  const [pages, setPages] = React.useState<PageProps[] | null>(null);

  useEffect(() => {

    if (readyState !== WebSocket.OPEN) {
      return;
    }

    sendJsonMessage({ method: "general.update" });
    sendJsonMessage({ method: "sheets.update" });

  }, [readyState, sendJsonMessage]);

  useLayoutEffect(() => {

    const method = lastJsonMessage?.method || "";

    switch (method) {
      case "sheets.update": {

        if (!isTypeOfReceiveSheetUpdateMessage(lastJsonMessage)) {
          return;
        }

        const emit = (data: EmitTypes) => {
          sendJsonMessage({ method: "emit", data });
        };

        const list = lastJsonMessage.data.map((page) => ({ ...page, emit })) as PageProps[];
        setPages(list);

        return;
      }

    }

  }, [lastJsonMessage, sendJsonMessage]);

  const values = {
    pages,
  };

  return (
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
