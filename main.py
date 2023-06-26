import json
import uvicorn
import subprocess
import os
import webbrowser
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# origins = [
#     "localhost:3000",
#     "http://localhost:3000",
#     "*"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


class Settings:

    def __init__(self) -> None:
        self.load()

    def load(self):
        with open("./settings.json", encoding="utf-8") as f:
            data = json.load(f)

            self.sheets = data["sheets"]
            self.actions = data["actions"]

    def exec(self, action_id: str) -> None:
        action = None
        for a in self.actions:
            if a["id"] == action_id:
                action = a
                break

        if action is None:
            return

        if action["type"] == "command":
            self._command(action["command"])

        if action["type"] == "browser":
            self._browser(action["url"])

    def _command(self, command) -> int:
        process = subprocess.Popen(command)
        return process.pid

    def _browser(self, url: str):
        return webbrowser.open(url)

class ConnectionManager:

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []
        self.settings = Settings()

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
        await websocket.send_json({ "method": "sheets.update", "data": self.settings.sheets })

    async def exec_receive(self, websocket: WebSocket, receive) -> None:
        if "method" not in receive:
            pass

        elif receive["method"] == "emit":
            self.settings.exec(receive["data"]["action"])

        elif receive["method"] == "sheets.update":
            await self.send_update_sheets(websocket)


manager = ConnectionManager()





@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            await manager.exec_receive(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


app.mount("/", StaticFiles(directory="./client/build", html=True), name="index")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0")
