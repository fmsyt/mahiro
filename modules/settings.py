import json

class Settings:

    def __init__(self) -> None:
        self.load()

    def load(self):
        with open("./settings.json", encoding="utf-8") as f:
            data = json.load(f)
