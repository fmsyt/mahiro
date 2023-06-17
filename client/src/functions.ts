import { action } from "./interface";

function send(webSocket: WebSocket, method: "execute" | "sheets.update", data?: any) {

  const body = JSON.stringify({ method, data });
  webSocket.send(body);
}

export function requestSheets(webSocket: WebSocket) {
  send(webSocket, "sheets.update");
}

export function control(webSocket: WebSocket, action: action, data?: any) {
  send(webSocket, "execute", {
    key: action.id,
    data
  });
}
