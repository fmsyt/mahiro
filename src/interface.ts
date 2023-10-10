'use strict'

export interface controlProps {
  control_id?: string;
  style: "button" | "slider" | "empty";
  label?: string | null;
  icon?: string | null;
  default?: number | string | boolean | null;
  description?: string | null;
  props?: {
    [key: string]: number | string | boolean | null;
  }
}

export interface browserControlProps extends controlProps {
  url: string;
}

export interface commandControlProps extends controlProps {
  commands: string[];
  sync: boolean;
}

export interface keyboardControlProps extends controlProps {
  text: string;
}

export interface hotkeyControlProps extends controlProps {
  hotkeys: string[];
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfControlProps(data: any): data is controlProps {
  if (typeof data !== "object") {
    return false;
  }

  if (typeof data.style !== "string") {
    throw new Error("data.style is not string");
  }

  if (![ "button", "slider", "empty" ].some((style) => style === data.style)) {
    throw new Error("data.style is not button, slider, or empty");
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
  items: controlProps[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfPageProps(data: any): data is pageProps {

  if (typeof data !== "object") {
    console.debug("data is not object");
    return false;
  }

  const passed = typeof data.columns === "number"
    && typeof data.items === "object" && Array.isArray(data.items)

  if (!passed) {
    console.debug("data is not pageProps");
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = data.items as Array<any>;
  const allPassed = items.every(isTypeOfControlProps);

  return allPassed;
}
