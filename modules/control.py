import subprocess
import webbrowser

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

class Control:
    def __init__(self, control_id: str, action_type: str, style: str = "button") -> None:
        self.control_id = control_id
        self.action_type = action_type
        self.style = style

    def to_sheet_item(self, label: str):
        return SheetItem(control_id=self.control_id, label=label, style=self.style)

    def action(self, event_name: str):
        if event_name == "key_down":
            return self._key_down()
        elif event_name == "key_up":
            return self._key_up()
        elif event_name == "touch_tap":
            return self._touch_tap()
        elif event_name == "dial_down":
            return self._dial_down()
        elif event_name == "dial_up":
            return self._dial_up()
        elif event_name == "dial_rotate":
            return self._dial_rotate()
        elif event_name == "will_appear":
            return self._will_appear()
        elif event_name == "will_disappear":
            return self._will_disappear()
        elif event_name == "title_parameters_did_change":
            return self._title_parameters_did_change()
        elif event_name == "device_did_connect":
            return self._device_did_connect()
        elif event_name == "device_did_disconnect":
            return self._device_did_disconnect()
        elif event_name == "application_did_launch":
            return self._application_did_launch()
        elif event_name == "application_did_terminate":
            return self._application_did_terminate()
        elif event_name == "system_did_wake_up":
            return self._system_did_wake_up()
        elif event_name == "property_inspector_did_appear":
            return self._property_inspector_did_appear()
        elif event_name == "property_inspector_did_disappear":
            return self._property_inspector_did_disappear()
        elif event_name == "send_to_plugin":
            return self._send_to_plugin()

        return

    def _key_down(self): pass
    def _key_up(self): pass
    def _touch_tap(self): pass
    def _dial_down(self): pass
    def _dial_up(self): pass
    def _dial_rotate(self): pass
    def _will_appear(self): pass
    def _will_disappear(self): pass
    def _title_parameters_did_change(self): pass
    def _device_did_connect(self): pass
    def _device_did_disconnect(self): pass
    def _application_did_launch(self): pass
    def _application_did_terminate(self): pass
    def _system_did_wake_up(self): pass
    def _property_inspector_did_appear(self): pass
    def _property_inspector_did_disappear(self): pass
    def _send_to_plugin(self): pass

class CommandControl(Control):
    def __init__(self, control_id: str, command: str | list[str], style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="command", style=style)

        self.command = command

    def _key_up(self):
        subprocess.Popen(self.command)


class BrowserControl(Control):
    def __init__(self, control_id: str, url: str, style: str = "button") -> None:
        super().__init__(control_id=control_id, action_type="browser", style=style)

        self.url = url

    def _key_up(self):
        webbrowser.open(self.url)

class Controller:
    def __init__(self) -> None:
        self.controls: list[Control] = [
            CommandControl(control_id="explorer", command="explorer.exe"),
            CommandControl(control_id="windows_terminal", command="wt"),
            CommandControl(control_id="display_clone", command=["D:\\Users\\motsuni\\Desktop\\DisplaySwitch.exe", "/clone"]),
            CommandControl(control_id="display_extend", command=["D:\\Users\\motsuni\\Desktop\\DisplaySwitch.exe", "/extend"]),
            BrowserControl(control_id="mui", url="https://mui.com/"),
        ]

        self.sheets: list[list[SheetItem | None]] = [
            [
                self.controls[0].to_sheet_item("Explorer"),
                self.controls[1].to_sheet_item("wt"),
                self.controls[2].to_sheet_item("複製"),
                None,
                self.controls[3].to_sheet_item("拡張"),
                self.controls[4].to_sheet_item("mui"),
            ]
        ]

    def get_control(self, control_id: str) -> Control | None:
        control = next(filter(lambda x: x.control_id == control_id, self.controls), None)
        return control

    def action(self, control_id: str, event_name: str):
        control = self.get_control(control_id)
        if control is None:
            return

        control.action(event_name)
