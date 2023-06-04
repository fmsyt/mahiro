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
    [host, port] = request.headers.get('host').split(":")

    return RedirectResponse(f"http://{host}:3000")


@app.get("/actions")
def actions():
    return JSONResponse({
        "actions": [[
            {
                "id": "launch_vscode",
                "label": "VSCode",
                "type": "button"
            },
            {
                "id": "volume",
                "label": "Volume",
                "type": "slider"
            },
        ]]
    })


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            subprocess.Popen("calc")

            await websocket.send_text(f"Message text was: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    except KeyboardInterrupt:
        manager.disconnect(websocket)
