import { createContext } from "react";
import { ReadyState } from "react-use-websocket";
import { ReceiveJsonMessage } from "./interface";
import { SendJsonMessage, WebSocketLike } from "react-use-websocket/dist/lib/types";
import { WebSocketConnection, defaultConnection } from "./webSocket";

interface WebSocketContextTypes {
  readyState?: ReadyState;
  sendJsonMessage: SendJsonMessage;
  lastJsonMessage: ReceiveJsonMessage | null;
  WebSocketLike?: WebSocketLike;
  tokenRequired: boolean;
  connection: WebSocketConnection;
  setToken: (token: string) => void;
}

const defaultValues: WebSocketContextTypes = {
  readyState: undefined,
  lastJsonMessage: null,
  tokenRequired: false,
  connection: defaultConnection,
  sendJsonMessage: () => {},
  setToken: () => {},
}

const WebSocketContext = createContext<WebSocketContextTypes>(defaultValues);

export default WebSocketContext;
