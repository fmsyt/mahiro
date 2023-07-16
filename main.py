import uvicorn
import os
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles

from modules.control import Controller
from modules.settings import Settings

app = FastAPI()



class ConnectionManager:

    def __init__(self, settings: Settings) -> None:

        self.settings = settings

        self.controller = Controller(settings)
        self.active_connections: List[WebSocket] = []
        # self.settings = Settings()


    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        await self.send_update_sheets(websocket)
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_update_sheets(self, websocket: WebSocket) -> None:
        sheets = self.controller.sheets_json()
        await websocket.send_json({ "method": "sheets.update", "data": sheets })

    async def exec_receive(self, websocket: WebSocket, receive) -> None:
        if "method" not in receive:
            pass

        elif receive["method"] == "emit":
            await self.controller.emit(control_id=receive["data"]["action"], event_name=receive["data"]["event"])

        elif receive["method"] == "sheets.update":
            await self.send_update_sheets(websocket)


settings = Settings()
manager = ConnectionManager(settings)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            await manager.exec_receive(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


if os.path.isfile("./client/build/index.html"):
    app.mount("/", StaticFiles(directory="./client/build", html=True), name="index")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.get_port())
