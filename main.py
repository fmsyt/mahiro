import uvicorn
import os
from uuid import UUID, uuid4

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, status, WebSocket, WebSocketDisconnect, WebSocketException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from modules.session import SessionData, cookie, backend, verifier
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



manager = ConnectionManager(settings)


@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response):
    os.getlogin()

    if form_data.username != os.getlogin():
        raise HTTPException(status_code=400, detail="Incorrect username or password")


    token = uuid4()
    session = uuid4()
    data = SessionData(token=token)

    await backend.create(session, data)
    cookie.attach_to_response(response, session)

    return {"access_token": token, "token_type": "bearer"}



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token=Query(default=None)):

    if settings.get("require_token") and token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

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
