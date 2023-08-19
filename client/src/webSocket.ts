export interface webSocketConditionsTypes {
  protocol: "ws" | "wss",
  hostname: string,
  port?: number,
  token?: string | null,
}

const defaultProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const defaultPort = import.meta.env.MODE === "production" ? window.location.port : "8000";
const defaultWebSocketToken = localStorage.getItem("wsToken");

export const defaultWebSocketConditions: webSocketConditionsTypes = {
  protocol: defaultProtocol as "ws" | "wss",
  hostname: window.location.hostname,
  port: parseInt(defaultPort),
  token: defaultWebSocketToken,
}

export function createWebSocket(conditions: webSocketConditionsTypes): WebSocket {
  const { protocol, hostname, port, token } = conditions;
  const ws = new WebSocket(`${protocol}://${hostname}:${port}/ws?token=${token}`);

  return ws;
}
