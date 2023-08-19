import json
import socket
import os

default_sheets_file_path = os.path.expanduser("~/.config/mahiro/sheets.json")
default_controls_file_path = os.path.expanduser("~/.config/mahiro/controls.json")
default_port = 8000
default_require_token = True
default_token_expiration = None
default_origins = ["*"]
hostname = socket.gethostname()

class Settings:

    general = {
        "sheets_file_path": default_sheets_file_path,
        "controls_file_path": default_controls_file_path,
        "port": default_port,
        "require_token": default_require_token,
        "token_expiration": default_token_expiration,
        "hostname": hostname,
        "origins": default_origins,
    }

    def __init__(self) -> None:
        self.load()

    def load(self):

        # Load settings from ~/.config/mahiro/settings.json
        try:
            with open(os.path.expanduser("~/.config/mahiro/settings.json"), "r") as f:
                self.general.update(json.load(f))

        # If the file doesn't exist, create it with default settings
        except FileNotFoundError:
            self.save()

    def save(self):

        if not os.path.exists(os.path.expanduser("~/.config/mahiro")):
            os.makedirs(os.path.expanduser("~/.config/mahiro"))

        with open(os.path.expanduser("~/.config/mahiro/settings.json"), "w") as f:
            json.dump(self.general, f, indent=2)

    def get(self, key):
        return self.general[key]

    def set(self, key, value):
        self.general[key] = value
        self.save()

    def get_sheets_file_path(self):
        return self.general["sheets_file_path"] if "sheets_file_path" in self.general else default_sheets_file_path

    def set_sheets_file_path(self, path):
        self.general["sheets_file_path"] = path
        self.save()

    def get_controls_file_path(self):
        return self.general["controls_file_path"] if "controls_file_path" in self.general else default_controls_file_path

    def set_controls_file_path(self, path):
        self.general["controls_file_path"] = path
        self.save()

    def get_port(self) -> int:
        return self.general["port"] if "port" in self.general else default_port

    def set_port(self, port):
        self.general["port"] = port
        self.save()
