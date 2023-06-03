import React, { useCallback, useEffect, useState } from "react";
import { action } from "./interface";
import Button from "./components/button";
import Slider from "./components/slider";

const Controller = () => {

  const [actions, setActions] = useState<action[][]>([]);

  const [webSocket, setWebSocket] = useState<WebSocket>();

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:8000/ws");

    webSocket.addEventListener("open", (e: Event) => {
      console.log("WebSocket Connection Established.");
    })

    webSocket.addEventListener("close", (e: CloseEvent) => {
      console.log("WebSocket Connection Closed.");
    })

    setWebSocket(webSocket);

    return () => {
      webSocket.close();
    }

  }, []);


  useEffect(() => {
    setActions([[
      {
        id: "launch_vscode",
        label: "VSCode",
        type: "button"
      },
      {
        id: "volume",
        label: "Volume",
        type: "slider"
      },
    ]]);
  }, []);

  const putElement = useCallback((action: action, key?: React.Key) => {
    switch (action.type) {
      case "button":
        return <Button key={key} action={action} webSocket={webSocket} />;

      case "slider":
        return <Slider key={key} action={action} webSocket={webSocket} />;

      default:
        throw Error();
    }

  }, [webSocket]);

  return (
    <div>
      {actions.map((actions, page) => actions.map((action, i) => putElement(action, (page + 1) * (i + 1))))}
    </div>
  )

}

export default Controller;
