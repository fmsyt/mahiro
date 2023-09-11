export interface controlProps {
  id: string
  label: string
  icon: string

  style: "button" | "slider" | "empty"
  current?: number | string
  props?: {
    [key: string]: number | string | boolean | null
  }
  disabled?: boolean
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfControlProps(data: any): data is controlProps {
  if (typeof data !== "object") {
    return false;
  }

  return typeof data.id === "number"
    && typeof data.label === "string"
    && typeof data.icon === "string"
    && ["button", "slider"].includes(data.style)
    && (typeof data.current === "undefined" || typeof data.current === "string")
    ;
}

export interface pageProps {
  columns: number
  items: controlProps[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTypeOfPageProps(data: any): data is pageProps {

  if (typeof data !== "object") {
    return false;
  }

  const passed = typeof data.columns === "number"
    && typeof data.items === "object" && Array.isArray(data.items)

  if (!passed) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = data.items as Array<any>;
  return items.every((item) => isTypeOfControlProps(item));
}
