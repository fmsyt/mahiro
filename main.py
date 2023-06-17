import json
import uvicorn
import subprocess
from typing import List

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

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

@app.get("/")
def index(request: Request):
    host = request.headers.get('host')
    [hostname, port] = host.split(":") if host is not None else "localhost"

    return RedirectResponse(f"http://{host}:3000")


class Settings:

    def __init__(self) -> None:
        self.load()

    def load(self):
        with open("./settings.json", encoding="utf-8") as f:
            data = json.load(f)

            self.sheets = data["sheets"]
            self.actions = data["actions"]


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

    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_update_sheets(self, websocket: WebSocket) -> None:
        await websocket.send_json({ "method": "sheets.update", "data": self.settings.sheets })

    async def exec_receive(self, websocket: WebSocket, data) -> None:
        if "method" not in data:
            pass

        elif data["method"] == "execute":

            action = None

            for a in self.settings.actions:
                if a["id"] == data["data"]["key"]:
                    action = a
                    break

            if action is None:
                return

            if action["type"] == "command":
                return self._command(action["command"])


        elif data["method"] == "sheets.update":
            await self.send_update_sheets(websocket)

    def _command(self, command):
        return subprocess.Popen(command)


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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0")
