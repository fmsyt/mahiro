import { useMemo, useState } from "react";
import WebSocketContext from "./WebSocketContext";
import useWebSocket from "react-use-websocket";
import { defaultConnection, toURL, WebSocketConnection } from "./webSocket";
import { ReceiveJsonMessage } from "./interface";

interface WebSocketProviderProps {
  children: React.ReactNode;
  connection?: WebSocketConnection;
}

const WebSocketProvider = (props: WebSocketProviderProps) => {

  const { children, connection: webSocketConnection } = props;

  const [token, setToken] = useState<string | null>(webSocketConnection?.token || defaultConnection.token);
  const [tokenRequired, setTokenRequired] = useState(false);

  const connection = useMemo(() => {
    const conditions = webSocketConnection || defaultConnection;
    return { ...conditions, token };

  }, [token, webSocketConnection])


  const use = useWebSocket<ReceiveJsonMessage>(toURL(connection), {
    onOpen: () => {
      console.log("Connection opened");
      setTokenRequired(false);
    },
    shouldReconnect: (event) => {
      // 1008 is the code for "Policy Violation"
      if (event.code === 1008) {
        setTokenRequired(true);
        return false;
      }

      return true;
    },
    reconnectAttempts: 10,
    reconnectInterval: 1000,
  });

  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = use;
  const values = {
    readyState,
    sendJsonMessage,
    lastJsonMessage,
    getWebSocket,
    tokenRequired,
    setToken,
    connection,
  };

  return (
    <WebSocketContext.Provider value={values}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
