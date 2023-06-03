import subprocess
from typing import Union

from fastapi import Body, FastAPI, status, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def index():
    return RedirectResponse("http://localhost:3000")


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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        subprocess.Popen("calc")

        await websocket.send_text(f"Message text was: {data}")

