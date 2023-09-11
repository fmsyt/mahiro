export interface controlProps {
  style: "button" | "slider" | "empty";
  control_id?: string | null;
  label?: string | null;
  icon?: string | null;
  default?: number | string | boolean | null;
  props?: {
    [key: string]: number | string | boolean | null;
  }
  disabled?: boolean | null;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfControlProps(data: any): data is controlProps {
  if (typeof data !== "object") {
    return false;
  }

  const styleIsValid = data.style === "button" || data.style === "slider" || data.style === "empty";
  const controlIdIsValid = typeof data.control_id === "string" || data.control_id == null;
  const labelIsValid = typeof data.label === "string" || data.label == null;
  const iconIsValid = typeof data.icon === "string" || data.icon == null;
  const defaultIsValid = typeof data.default === "number" || typeof data.default === "string" || typeof data.default === "boolean" || data.default == null;
  const propsIsValid = typeof data.props === "object" || data.props == null;
  const disabledIsValid = typeof data.disabled === "boolean" || data.disabled == null;

  return styleIsValid && controlIdIsValid && labelIsValid && iconIsValid && defaultIsValid && propsIsValid && disabledIsValid;
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
