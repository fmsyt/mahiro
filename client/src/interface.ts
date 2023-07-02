export interface controlProps {
  id: string
  label: string
  icon: string

  style: "button" | "slider"
  current?: number | string
}

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
  controls: controlProps[]
}

export function isTypeOfPageProps(data: any): data is pageProps {

  if (typeof data !== "object") {
    return false;
  }

  return typeof data.columns === "number"
    && Array.isArray(data.controls) && data.controls.findIndex((row: any) => !isTypeOfControlProps(row)) === -1
    ;
}
