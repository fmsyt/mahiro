import uvicorn
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from modules.settings import Settings
from modules.websocket import ConnectionManager

settings = Settings()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get("origins"),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)



manager = ConnectionManager(settings)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            await manager.receive(websocket, data)

    except WebSocketDisconnect:
        await manager.disconnect(websocket)

    except KeyboardInterrupt:
        for websocket in manager.active_connections:
            await manager.disconnect(websocket)


if os.path.isfile("./public/index.html"):
    app.mount("/", StaticFiles(directory="./public", html=True), name="index")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.get_port())
