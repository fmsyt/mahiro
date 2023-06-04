import { action } from "./interface";

function send(webSocket: WebSocket, method: "execute" | "update_sheets", data?: any) {

  const body = JSON.stringify({ method, data });
  webSocket.send(body);
}

export function requestSheets(webSocket: WebSocket) {
  send(webSocket, "update_sheets");
}

export function control(webSocket: WebSocket, action: action, data?: any) {
  send(webSocket, "execute", {
    key: action.id,
    data
  });
}
