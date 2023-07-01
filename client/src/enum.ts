export enum Events {
  keyDown = "key_down",
  keyUp = "key_up",
  touchTap = "touch_tap",
  dialDown = "dial_down",
  dialUp = "dial_up",
  dialRotate = "dial_rotate",
  willAppear = "will_appear",
  willDisappear = "will_disappear",
  titleParametersDidChange = "title_parameters_did_change",
  deviceDidConnect = "device_did_connect",
  deviceDidDisconnect = "device_did_disconnect",
  applicationDidLaunch = "application_did_launch",
  applicationDidTerminate = "application_did_terminate",
  systemDidWakeUp = "system_did_wake_up",
  propertyInspectorDidAppear = "property_inspector_did_appear",
  propertyInspectorDidDisappear = "property_inspector_did_disappear",
  sendToPlugin = "send_to_plugin",
}

export enum ControlTypes {
  command = "command",
  launch = "launch",
  keyboard = "keyboard",
  browser = "browser",
}
