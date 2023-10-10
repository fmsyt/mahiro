export interface controlProps {
  id: string;
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

  const styleIsValid = data.style === "button" || data.style === "slider" || data.style === "empty";
  const idIsValid = typeof data.id === "string";
  const labelIsValid = typeof data.label === "string" || data.label == null;
  const iconIsValid = typeof data.icon === "string" || data.icon == null;
  const defaultIsValid = typeof data.default === "number" || typeof data.default === "string" || typeof data.default === "boolean" || data.default == null;
  const descriptionIsValid = typeof data.description === "string" || data.description == null;
  const propsIsValid = typeof data.props === "object" || data.props == null;

  return styleIsValid
    && idIsValid
    && labelIsValid
    && iconIsValid
    && defaultIsValid
    && descriptionIsValid
    && propsIsValid
    ;
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
