import { Events } from "./enum";

function send(webSocket: WebSocket, method: string, data?: any) {
  const body = JSON.stringify({ method, data });
  webSocket.send(body);
}

export function updateGeneral(webSocket: WebSocket) {
  send(webSocket, "general.update");
}

export function updateSheets(webSocket: WebSocket) {
  send(webSocket, "sheets.update");
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
  send(ws, "emit", data);
}
