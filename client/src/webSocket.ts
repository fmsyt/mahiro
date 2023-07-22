import React from "react";

export function useWebSocket(uri: string) {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {

    const connect = () => {

      if (socket?.readyState === WebSocket.OPEN) {
        return;
      }


      const ws = new WebSocket(uri);
      ws.addEventListener("close", () => setSocket(null));

      setSocket(ws);

      return ws;
    };

    const interval = setInterval(connect, 1000);

    return () => {
      socket && socket.close();
      clearInterval(interval);
    };

  }, [socket, uri]);

  return socket;
}
