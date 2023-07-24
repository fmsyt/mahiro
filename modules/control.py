import os
import json
import platform as p

import pyautogui
import subprocess
import webbrowser

from dataclasses import dataclass
from pynput.keyboard import Controller as KeyboardController

from modules.settings import Settings

@dataclass
class SheetItem:

    def __init__(self, control_id: str | None = None, style: str = "button", label: str = "", disabled: bool = False, props: dict | None = None, **kwargs) -> None:
        """
        Args:
            id (str): id of control
            label (str): display string to client
            type (str, optional): define style of component. Defaults to "button".
        """

        for x in kwargs:
            setattr(self, x, kwargs[x])

        self.id = control_id
        self.style = style
        self.label = label
        self.disabled = disabled
        self.props = props

@dataclass
class Sheet:
    def __init__(self, columns: int, controls: list[SheetItem] = []) -> None:
        self.columns = columns
        self.controls = controls

class Control:
    def __init__(self, action_type: str, control_id: str | None = None, style: str = "empty", platform: str | list[str] | None= None, props: dict | None = None, **kwargs) -> None:

        self.kwargs = kwargs

        self.control_id = control_id
        self.action_type = action_type
        self.style = style
        self.props = props

        self.disabled = False

        if platform is None:
            self.disabled = False
        elif isinstance(platform, str):
            self.disabled = platform != p.system()
        elif isinstance(platform, list):
            self.disabled = p.system() not in platform


    def to_sheet_item(self, label: str):
        return SheetItem(control_id=self.control_id, label=label, style=self.style, disabled=self.disabled, props=self.props, **self.kwargs)

    async def action(self, event_name: str, data: dict | None = None):
        if event_name == "key_down":
            return await self._key_down(data)
        elif event_name == "key_up":
            return await self._key_up(data)
        elif event_name == "touch_tap":
            return await self._touch_tap(data)
        elif event_name == "dial_down":
            return await self._dial_down(data)
        elif event_name == "dial_up":
            return await self._dial_up(data)
        elif event_name == "dial_rotate":
            return await self._dial_rotate(data)
        elif event_name == "will_appear":
            return await self._will_appear(data)
        elif event_name == "will_disappear":
            return await self._will_disappear(data)
        elif event_name == "title_parameters_did_change":
            return await self._title_parameters_did_change(data)
        elif event_name == "device_did_connect":
            return await self._device_did_connect(data)
        elif event_name == "device_did_disconnect":
            return await self._device_did_disconnect(data)
        elif event_name == "application_did_launch":
            return await self._application_did_launch(data)
        elif event_name == "application_did_terminate":
            return await self._application_did_terminate(data)
        elif event_name == "system_did_wake_up":
            return await self._system_did_wake_up(data)
        elif event_name == "property_inspector_did_appear":
            return await self._property_inspector_did_appear(data)
        elif event_name == "property_inspector_did_disappear":
            return await self._property_inspector_did_disappear(data)
        elif event_name == "send_to_plugin":
            return await self._send_to_plugin(data)

        return

    async def _key_down(self, data: dict | None = None): pass
    async def _key_up(self, data: dict | None = None): pass
    async def _touch_tap(self, data: dict | None = None): pass
    async def _dial_down(self, data: dict | None = None): pass
    async def _dial_up(self, data: dict | None = None): pass
    async def _dial_rotate(self, data: dict | None = None): pass
    async def _will_appear(self, data: dict | None = None): pass
    async def _will_disappear(self, data: dict | None = None): pass
    async def _title_parameters_did_change(self, data: dict | None = None): pass
    async def _device_did_connect(self, data: dict | None = None): pass
    async def _device_did_disconnect(self, data: dict | None = None): pass
    async def _application_did_launch(self, data: dict | None = None): pass
    async def _application_did_terminate(self, data: dict | None = None): pass
    async def _system_did_wake_up(self, data: dict | None = None): pass
    async def _property_inspector_did_appear(self, data: dict | None = None): pass
    async def _property_inspector_did_disappear(self, data: dict | None = None): pass
    async def _send_to_plugin(self, data: dict | None = None): pass

class EmptyControl(Control):
    def __init__(self, style: str = "empty", **kwargs) -> None:
        super().__init__(control_id=None, action_type="empty", style=style, **kwargs)

class CommandControl(Control):
    def __init__(self, control_id: str, command: str | list[str], style: str = "button", sync: bool = True, **kwargs) -> None:
        super().__init__(control_id=control_id, action_type="command", style=style, **kwargs)

        self.command = command
        self.sync = sync

    async def _key_up(self, data: dict | None = None):

        command = self.command

        if data is not None and "context" in data:
            if isinstance(command, list):
                command = list(map(lambda param: param.format(context=data["context"]), command))
            else:
                command = command.format(context=data["context"])

        print(command if type(command) is str else " ".join(command))

        if self.sync:
            subprocess.run(command)
        else:
            subprocess.Popen(self.command)


class BrowserControl(Control):
    def __init__(self, control_id: str, url: str, style: str = "button", **kwargs) -> None:
        super().__init__(control_id=control_id, action_type="browser", style=style, **kwargs)

        self.url = url

    async def _key_up(self, data: dict | None = None):
        webbrowser.open(self.url)


class KeyState:
    def __init__(self, key: str, ctrl: bool | None = None, shift: bool | None = None, alt: bool | None = None ) -> None:
        self.key = key
        self.ctrl = ctrl
        self.shift = shift
        self.alt = alt

_keyboard = KeyboardController()

class KeyboardControl(Control):
    def __init__(self, control_id: str, text: str, style: str = "button", **kwargs) -> None:
        super().__init__(control_id=control_id, action_type="keyboard", style=style, **kwargs)

        self.text = text

    async def _key_up(self, data: dict | None = None):
        _keyboard.type(self.text)

class HotKeyControl(Control):
    def __init__(self, control_id: str, hotkey: str, style: str = "button", **kwargs) -> None:
        super().__init__(control_id=control_id, action_type="hotkey", style=style, **kwargs)

        self.hotkey = hotkey

    async def _key_up(self, data: dict | None = None):
        pyautogui.hotkey(*self.hotkey)

def _control_from_dict(**kwargs) -> Control:

    action_type = kwargs["type"]

    if action_type == "command":
        return CommandControl(**kwargs)
    elif action_type == "browser":
        return BrowserControl(**kwargs)
    elif action_type == "keyboard":
        return KeyboardControl(**kwargs)
    elif action_type == "hotkey":
        return HotKeyControl(**kwargs)

    return EmptyControl(**kwargs)


class Controller:

    controls: list[Control] = []
    sheets: list[Sheet] = []

    controls_raw: list[dict] = []
    sheets_raw: list[dict] = []

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.reload()

    def reload(self):
        self.load_controls()
        self.load_sheets()

    def load_controls(self):
        controls_file_path = self.settings.get_controls_file_path()

        try:
            with open(controls_file_path, "r", encoding="utf-8") as f:
                self.controls_raw = json.load(f)

        except FileNotFoundError:
            self.controls_raw = []
            self.save_controls()

        self.controls = list(map(lambda control: _control_from_dict(**control), self.controls_raw)) # type: ignore

    def load_sheets(self):
        sheets_file_path = self.settings.get_sheets_file_path()

        try:
            with open(sheets_file_path, "r", encoding="utf-8") as f:
                self.sheets_raw = json.load(f)

        except FileNotFoundError:
            self.sheets_raw = []
            self.save_sheets()

    def save_controls(self):
        controls_file_path = self.settings.get_controls_file_path()

        if not os.path.exists(os.path.dirname(controls_file_path)):
            os.makedirs(os.path.dirname(controls_file_path))

        with open(controls_file_path, "w") as f:
            json.dump(self.controls_raw, f)

    def save_sheets(self):
        sheets_file_path = self.settings.get_sheets_file_path()

        if not os.path.exists(os.path.dirname(sheets_file_path)):
            os.makedirs(os.path.dirname(sheets_file_path))

        with open(sheets_file_path, "w") as f:
            json.dump(self.sheets_raw, f)


    def get_control(self, control_id: str | None) -> Control:

        # find control by id

        if control_id is None:
            return EmptyControl()

        control = next(filter(lambda control: control.control_id == control_id, self.controls), EmptyControl()) # type: ignore
        return control

    async def emit(self, control_id: str, event_name: str, data: dict | None = None):
        control = self.get_control(control_id)
        if control is None:
            return

        await control.action(event_name, data)


    def sheets_json(self):

        sheets = list(map(lambda sheet: Sheet(columns=sheet["columns"], controls=list(map(lambda sheet_control: self.get_control(sheet_control["control_id"] if "control_id" in sheet_control else None).to_sheet_item(sheet_control["label"] if "label" in sheet_control else None), sheet["controls"]))), self.sheets_raw)) # type: ignore

        result = list(map(lambda sheet: dict(
            columns=sheet.columns,
            controls=list(map(lambda item: None if item is None else item.__dict__, sheet.controls))
        ), sheets))

        return result

