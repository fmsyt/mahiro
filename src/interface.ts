'use strict'

export enum ControlStyle {
  Button = "button",
  Slider = "slider",
  Empty = "empty",
}

export enum ControlType {
  Command = "command",
  Browser = "browser",
  Keyboard = "keyboard",
  Hotkey = "hotkey",
}

export interface ConfigControlProps {
  id: string;
  type: string;
  // default?: string | null;
  icon?: string | null;
  description?: string | null;
  props?: {
    [key: string]: number | string | boolean | null;
  }

  [key: string]: unknown;
}

export interface ConfigBrowserControlProps extends ConfigControlProps {
  url: string;
}

export interface ConfigCommandControlProps extends ConfigControlProps {
  commands: string[];
  sync?: boolean;
}

export interface ConfigKeyboardControlProps extends ConfigControlProps {
  text: string;
}

export interface ConfigHotkeyControlProps extends ConfigControlProps {
  hotkeys: string[];
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigControl(data: any): data is ConfigControlProps {
  if (typeof data !== "object") {
    throw new Error("data is not object");
  }

  if (typeof data.id !== "string") {
    throw new Error("id is not string");
  }

  if (typeof data.type !== "string") {
    throw new Error("type is not string");
  }

  if (!Object.values(ControlType).includes(data.type)) {
    throw new Error(`type is not ControlType: ${data.type}`);
  }

  if (data.icon != null && typeof data.icon !== "string") {
    throw new Error("icon is not string");
  }

  if (data.description != null && typeof data.description !== "string") {
    throw new Error("description is not string");
  }

  if (data.props != null && typeof data.props !== "object") {
    throw new Error("props is not object");
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigBrowserControl(data: any): data is ConfigBrowserControlProps {
  if (!isTypeOfConfigControl(data)) {
    throw new Error("data is not ControlProps");
  }

  if (data.type !== "browser") {
    throw new Error("type is not browser");
  }

  if (typeof data.url !== "string") {
    throw new Error("url is not string");
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigCommandControl(data: any): data is ConfigCommandControlProps {
  if (!isTypeOfConfigControl(data)) {
    throw new Error("data is not ControlProps");
  }

  if (data.type !== "command") {
    throw new Error("type is not command");
  }

  if (!Array.isArray(data.commands)) {
    throw new Error("commands is not array");
  }

  if (data.commands.some((command) => typeof command !== "string")) {
    throw new Error("commands is not string[]");
  }

  if (data.sync != null && typeof data.sync !== "boolean") {
    throw new Error("sync is not boolean");
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigKeyboardControl(data: any): data is ConfigKeyboardControlProps {
  if (!isTypeOfConfigControl(data)) {
    throw new Error("data is not ControlProps");
  }

  if (data.type !== "keyboard") {
    throw new Error("type is not keyboard");
  }

  if (typeof data.text !== "string") {
    throw new Error("text is not string");
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigHotkeyControl(data: any): data is ConfigHotkeyControlProps {
  if (!isTypeOfConfigControl(data)) {
    throw new Error("data is not ControlProps");
  }

  if (data.type !== "hotkey") {
    throw new Error("type is not hotkey");
  }

  if (!Array.isArray(data.hotkeys)) {
    throw new Error("hotkeys is not array");
  }

  if (data.hotkeys.some((hotkey) => typeof hotkey !== "string")) {
    throw new Error("hotkeys is not string[]");
  }

  return true;
}


export interface ConfigSheetItemProps {
  control_id?: string;
  label?: string;
  type: ControlStyle;
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfConfigSheetItemProps(data: any): data is ConfigSheetItemProps {
  if (typeof data !== "object") {
    throw new Error("data is not object");
  }

  if (typeof data.type !== "string") {
    throw new Error("data.type is not string");
  }

  if (!Object.values(ControlStyle).includes(data.type)) {
    throw new Error("data.type is not ControlStyle");
  }

  if (typeof data.control_id !== "string" && data.control_id != null) {
    throw new Error("data.control_id is not string");
  }

  if (typeof data.label !== "string" && data.label != null) {
    throw new Error("data.label is not string or null");
  }

  if (typeof data.disabled !== "boolean" && data.disabled != null) {
    throw new Error("data.disabled is not boolean or null");
  }

  return true;
}



export interface ConfigSheetProps {
  columns: number;
  items: ConfigSheetItemProps[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfSheet(data: any): data is ConfigSheetProps {
  if (typeof data !== "object") {
    throw new Error("data is not object");
  }

  if (typeof data.columns !== "number") {
    throw new Error("data.columns is not number");
  }

  if (typeof data.items !== "object") {
    throw new Error("data.items is not object");
  }

  if (!Array.isArray(data.items)) {
    throw new Error("data.items is not array");
  }

  const items = data.items as Array<ConfigSheetItemProps>;
  const passed = items.every((item) => isTypeOfConfigSheetItemProps(item));
  if (!passed) {
    throw new Error("data.items is not ConfigSheetItemProps[]");
  }

  return true;
}




export interface SheetItemProps {
  control_id?: string;
  style: ControlStyle;
  label?: string | null;
  icon?: string | null;
  default?: number | string | boolean | null;
  description?: string | null;
  disabled?: boolean;
  props?: {
    [key: string]: number | string | boolean | null;
  }
}




// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfSheetItemProps(data: any): data is SheetItemProps {
  if (typeof data !== "object") {
    throw new Error("data is not object");
  }

  if (typeof data.style !== "string") {
    throw new Error("data.style is not string");
  }

  if (!Object.values(ControlStyle).includes(data.style)) {
    throw new Error("data.style is not ControlStyle");
  }

  if (typeof data.control_id !== "string" && data.control_id != null) {
    throw new Error("data.control_id is not string");
  }

  if (typeof data.label !== "string" && data.label != null) {
    throw new Error("data.label is not string or null");
  }

  if (typeof data.icon !== "string" && data.icon != null) {
    throw new Error("data.icon is not string or null");
  }

  if (typeof data.default !== "number" && typeof data.default !== "string" && typeof data.default !== "boolean" && data.default != null) {
    throw new Error("data.default is not number, string, boolean, or null");
  }

  if (typeof data.description !== "string" && data.description != null) {
    throw new Error("data.description is not string or null");
  }

  if (typeof data.props !== "object" && data.props != null) {
    throw new Error("data.props is not object or null");
  }

  return true;
}

export interface pageProps {
  columns: number
  items: SheetItemProps[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfPageProps(data: any): data is pageProps {

  if (typeof data !== "object") {
    throw new Error("data is not object");
  }

  if (typeof data.columns !== "number") {
    throw new Error("data.columns is not number");
  }

  if (typeof data.items !== "object") {
    throw new Error("data.items is not object");
  }

  if (!Array.isArray(data.items)) {
    throw new Error("data.items is not array");
  }

  const items = data.items as Array<SheetItemProps>;
  const passed = items.every((item) => isTypeOfSheetItemProps(item));
  if (!passed) {
    throw new Error("data.items is not SheetItemProps[]");
  }

  return true;
}
