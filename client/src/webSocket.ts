import { useEffect, useState } from "react";

function useWebSocket(uri: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(uri);
    setSocket(ws);
    return () => {
      ws.readyState === WebSocket.OPEN && ws.close();
    };
  }, [uri]);

  return socket;
}

export default useWebSocket;
