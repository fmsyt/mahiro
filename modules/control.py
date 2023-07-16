import os
import json

import keyboard
import subprocess
import webbrowser

from dataclasses import dataclass

from modules.settings import Settings

@dataclass
class SheetItem:

    def __init__(self, control_id: str, style: str = "button", label: str = "") -> None:
        """
        Args:
            id (str): id of control
            label (str): display string to client
            type (str, optional): define style of component. Defaults to "button".
        """

        self.id = control_id
        self.style = style
        self.label = label

@dataclass
class Sheet:
    def __init__(self, columns: int, controls: list[SheetItem|None] = []) -> None:
        self.columns = columns
        self.controls = controls

class Control:
    def __init__(self, control_id: str, action_type: str, style: str = "button") -> None:
        self.control_id = control_id
        self.action_type = action_type
        self.style = style

    def to_sheet_item(self, label: str):
        return SheetItem(control_id=self.control_id, label=label, style=self.style)

    async def action(self, event_name: str):
        if event_name == "key_down":
            return await self._key_down()
        elif event_name == "key_up":
            return await self._key_up()
        elif event_name == "touch_tap":
            return await self._touch_tap()
        elif event_name == "dial_down":
            return await self._dial_down()
        elif event_name == "dial_up":
            return await self._dial_up()
        elif event_name == "dial_rotate":
            return await self._dial_rotate()
        elif event_name == "will_appear":
            return await self._will_appear()
        elif event_name == "will_disappear":
            return await self._will_disappear()
        elif event_name == "title_parameters_did_change":
            return await self._title_parameters_did_change()
        elif event_name == "device_did_connect":
            return await self._device_did_connect()
        elif event_name == "device_did_disconnect":
            return await self._device_did_disconnect()
        elif event_name == "application_did_launch":
            return await self._application_did_launch()
        elif event_name == "application_did_terminate":
            return await self._application_did_terminate()
        elif event_name == "system_did_wake_up":
            return await self._system_did_wake_up()
        elif event_name == "property_inspector_did_appear":
            return await self._property_inspector_did_appear()
        elif event_name == "property_inspector_did_disappear":
            return await self._property_inspector_did_disappear()
        elif event_name == "send_to_plugin":
            return await self._send_to_plugin()

        return

    async def _key_down(self): pass
    async def _key_up(self): pass
    async def _touch_tap(self): pass
    async def _dial_down(self): pass
    async def _dial_up(self): pass
    async def _dial_rotate(self): pass
    async def _will_appear(self): pass
    async def _will_disappear(self): pass
    async def _title_parameters_did_change(self): pass
    async def _device_did_connect(self): pass
    async def _device_did_disconnect(self): pass
    async def _application_did_launch(self): pass
    async def _application_did_terminate(self): pass
    async def _system_did_wake_up(self): pass
    async def _property_inspector_did_appear(self): pass
    async def _property_inspector_did_disappear(self): pass
    async def _send_to_plugin(self): pass

class CommandControl(Control):
    def __init__(self, control_id: str, command: str | list[str], style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="command", style=style)

        self.command = command

    async def _key_up(self):
        subprocess.Popen(self.command)


class BrowserControl(Control):
    def __init__(self, control_id: str, url: str, style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="browser", style=style)

        self.url = url

    async def _key_up(self):
        webbrowser.open(self.url)


class KeyState:
    def __init__(self, key: str, ctrl: bool | None = None, shift: bool | None = None, alt: bool | None = None ) -> None:
        self.key = key
        self.ctrl = ctrl
        self.shift = shift
        self.alt = alt

class KeyboardControl(Control):
    def __init__(self, control_id: str, text: str, style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="keyboard", style=style)

        self.text = text

    async def _key_up(self):
        keyboard.write(self.text)

class HotKeyControl(Control):
    def __init__(self, control_id: str, hotkey: str, style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="hotkey", style=style)

        self.hotkey = hotkey

    async def _key_up(self):
        keyboard.send(self.hotkey)

def control_from_dict(**kwargs) -> Control:

    action_type = kwargs["type"]

    if action_type == "command":
        return CommandControl(**kwargs)
    elif action_type == "browser":
        return BrowserControl(**kwargs)
    elif action_type == "keyboard":
        return KeyboardControl(**kwargs)
    elif action_type == "hotkey":
        return HotKeyControl(**kwargs)

    raise Exception(f"Unknown type: {action_type}")


class Controller:
    def __init__(self, settings: Settings) -> None:

        self.settings = settings

        self.controls: list[Control] = [
            CommandControl(control_id="explorer", command="explorer.exe"),
            CommandControl(control_id="windows_terminal", command="wt"),
            CommandControl(control_id="display_clone", command=[f"D:\\Users\\motsuni\\Desktop\\DisplaySwitch.exe", "/clone"]),
            CommandControl(control_id="display_extend", command=[f"D:\\Users\\motsuni\\Desktop\\DisplaySwitch.exe", "/extend"]),
            BrowserControl(control_id="mui", url="https://mui.com/"),
            KeyboardControl(control_id="keyboard", text="test"),
            HotKeyControl(control_id="hotkey", hotkey="win+i"),
        ]

        self.sheets: list[Sheet] = [
            Sheet(columns=4, controls=[
                self.controls[0].to_sheet_item("Explorer"),
                self.controls[1].to_sheet_item("wt"),
                self.controls[2].to_sheet_item("複製"),
                None,
                self.controls[3].to_sheet_item("拡張"),
                self.controls[4].to_sheet_item("mui"),
                self.controls[5].to_sheet_item("keyboard"),
                self.controls[6].to_sheet_item("ctrl+i"),
            ]),
            Sheet(columns=3, controls=[
                self.controls[0].to_sheet_item("Explorer"),
                self.controls[1].to_sheet_item("wt"),
                self.controls[2].to_sheet_item("複製"),
                None,
                self.controls[3].to_sheet_item("拡張"),
                self.controls[4].to_sheet_item("mui"),
                self.controls[5].to_sheet_item("keyboard"),
                self.controls[6].to_sheet_item("ctrl+i"),
            ]),
        ]

    def load_controls(self):
        controls_file_path = self.settings.get_controls_file_path()

        try:
            with open(controls_file_path, "r") as f:
                controls_json = json.load(f)
                self.controls = list(map(control_from_dict, **controls_json)) # type: ignore
        except FileNotFoundError:
            self.controls = []

    def load_sheets(self):
        sheets_file_path = self.settings.get_sheets_file_path()

        try:
            with open(sheets_file_path, "r") as f:
                sheets_json = json.load(f)
                self.sheets = list(map(lambda sheet: Sheet(columns=sheet["columns"], controls=list(map(lambda control: self.get_control(control["control_id"])))), sheets_json)) # type: ignore

        except FileNotFoundError:
            self.sheets = []


    def get_control(self, control_id: str) -> Control | None:
        control = next(filter(lambda x: x.control_id == control_id, self.controls), None)
        return control

    async def emit(self, control_id: str, event_name: str):
        control = self.get_control(control_id)
        if control is None:
            return

        await control.action(event_name)


    def sheets_json(self):
        return list(map(lambda sheet: dict(
            columns=sheet.columns,
            controls=list(map(lambda item: None if item is None else item.__dict__, sheet.controls))
        ), self.sheets))

