import React from "react";

export function useWebSocket(uri: string) {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {
    const ws = new WebSocket(uri);
    setSocket(ws);
    return () => {
      ws.readyState === WebSocket.OPEN && ws.close();
    };
  }, [uri]);

  return socket;
}
