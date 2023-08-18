from typing import List

from fastapi import WebSocket

from modules.control import Controller
from modules.settings import Settings


class ConnectionManager:

    def __init__(self, settings: Settings) -> None:

        self.settings = settings

        self.controller = Controller(settings)
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_general_update(self, websocket: WebSocket) -> None:
        await websocket.send_json({ "method": "general.update", "data": self.settings.general })

    async def send_sheets_update(self, websocket: WebSocket) -> None:
        sheets = self.controller.sheets_json()
        await websocket.send_json({ "method": "sheets.update", "data": sheets })

    async def receive(self, websocket: WebSocket, receive) -> None:
        if "method" not in receive:
            pass

        elif receive["method"] == "emit":
            try:
                await self.controller.emit(control_id=receive["data"]["action"], event_name=receive["data"]["event"], data=receive["data"])

            except Exception as e:
                await websocket.send_json({ "method": "emit.error", "data": {
                    "received": receive,
                    "error": str(e)
                }})

                print(e)

        elif receive["method"] == "general.update":
            self.controller.reload()
            await self.send_general_update(websocket)

        elif receive["method"] == "sheets.update":
            self.controller.reload()
            await self.send_sheets_update(websocket)
