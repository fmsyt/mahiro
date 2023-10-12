export interface webSocketConditionsTypes {
  protocol: "ws" | "wss",
  hostname: string,
  port: number,
  token?: string | null,
}

const defaultProtocol = localStorage.getItem("lastConnectedProtocol") || (window.location.protocol === "https:" ? "wss" : "ws");
const defaultPort = localStorage.getItem("lastConnectedPort") || 17001;

const defaultHost = localStorage.getItem("lastConnectedHost") || window.location.hostname;
const defaultWebSocketToken = localStorage.getItem("wsToken");

export const defaultWebSocketConditions: webSocketConditionsTypes = {
  protocol: defaultProtocol as "ws" | "wss",
  hostname: defaultHost,
  port: Number(defaultPort),
  token: defaultWebSocketToken,
}

export function createWebSocket(conditions: webSocketConditionsTypes): WebSocket {
  const { protocol, hostname, port, token } = conditions;
  const ws = new WebSocket(`${protocol}://${hostname}:${port}/ws?token=${token}`);

  ws.addEventListener("open", () => {
    localStorage.setItem("lastConnectedProtocol", protocol);
    localStorage.setItem("lastConnectedHost", hostname);
    localStorage.setItem("lastConnectedPort", port.toString());
  });

  return ws;
}
