import { action } from "./interface";

export function control(webSocket: WebSocket, action: action, data?: any) {

  const body = JSON.stringify({
    key: action.id,
    data
  })

  webSocket.send(body)
}
