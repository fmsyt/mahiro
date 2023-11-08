export enum Events {
  keyDown = "keyDown",
  keyUp = "keyUp",
  touchTap = "touchTap",
  dialDown = "dialDown",
  dialUp = "dialUp",
  dialRotate = "dialRotate",
  willAppear = "willAppear",
  willDisappear = "willDisappear",
  titleParametersDidChange = "titleParametersDidChange",
  deviceDidConnect = "deviceDidConnect",
  deviceDidDisconnect = "deviceDidDisconnect",
  applicationDidLaunch = "applicationDidLaunch",
  applicationDidTerminate = "applicationDidTerminate",
  systemDidWakeUp = "systemDidWakeUp",
  propertyInspectorDidAppear = "propertyInspectorDidAppear",
  propertyInspectorDidDisappear = "propertyInspectorDidDisappear",
  sendToPlugin = "sendToPlugin",
}

export enum ControlTypes {
  command = "command",
  launch = "launch",
  keyboard = "keyboard",
  browser = "browser",
  empty = "empty",
}
