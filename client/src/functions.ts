import { Events } from "./enum";
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

interface emitTypes {
  action: string
  event: Events
  context?: number | string
  payload?: {
    coordinates?: {
      column: number
      row: number
    }
    isInMultiAction: boolean
    state?: string
    settings?: object
    userDesiredState?: string | number
  }
}

export function emit(ws: WebSocket, data: emitTypes) {

}
