import json
import os

default_sheets_file_path = os.path.expanduser("~/.config/mahiro/sheets.json")
default_controls_file_path = os.path.expanduser("~/.config/mahiro/controls.json")
default_port = 8000

class Settings:

    _settings = {
        "sheets_file_path": default_sheets_file_path,
        "controls_file_path": default_controls_file_path,
        "port": default_port,
    }

    def __init__(self) -> None:
        self.load()

    def load(self):

        # Load settings from ~/.config/mahiro/settings.json
        try:
            with open(os.path.expanduser("~/.config/mahiro/settings.json"), "r") as f:
                self._settings.update(json.load(f))

        # If the file doesn't exist, create it with default settings
        except FileNotFoundError:
            self.save()

    def save(self):

        if not os.path.exists(os.path.expanduser("~/.config/mahiro")):
            os.makedirs(os.path.expanduser("~/.config/mahiro"))

        with open(os.path.expanduser("~/.config/mahiro/settings.json"), "w") as f:
            json.dump(self._settings, f, indent=2)

    def get(self, key):
        return self._settings[key]

    def set(self, key, value):
        self._settings[key] = value
        self.save()

    def get_sheets_file_path(self):
        return self._settings["sheets_file_path"] if "sheets_file_path" in self._settings else default_sheets_file_path

    def set_sheets_file_path(self, path):
        self._settings["sheets_file_path"] = path
        self.save()

    def get_controls_file_path(self):
        return self._settings["controls_file_path"] if "controls_file_path" in self._settings else default_controls_file_path

    def set_controls_file_path(self, path):
        self._settings["controls_file_path"] = path
        self.save()

    def get_port(self) -> int:
        return self._settings["port"] if "port" in self._settings else default_port

    def set_port(self, port):
        self._settings["port"] = port
        self.save()
