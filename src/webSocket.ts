export interface WebSocketConnection {
  protocol: "ws" | "wss",
  hostname: string,
  port: number,
  token: string | null,
}

const defaultProtocol = localStorage.getItem("lastConnectedProtocol")
  || (window.location.protocol === "https:" ? "wss" : "ws")

const defaultPort = localStorage.getItem("lastConnectedPort")
  || 17001

const defaultHost = localStorage.getItem("lastConnectedHost")
  || window.location.hostname

const defaultWebSocketToken = localStorage.getItem("wsToken");

export function toURL(conditions: WebSocketConnection): string {
  const { protocol, hostname, port, token } = conditions;
  return `${protocol}://${hostname}:${port}${token ? `?token=${token}` : ""}`;
}

export const defaultConnection: WebSocketConnection = {
  protocol: defaultProtocol as "ws" | "wss",
  hostname: defaultHost,
  port: Number(defaultPort),
  token: defaultWebSocketToken,
}
