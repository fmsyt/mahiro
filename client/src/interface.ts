import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export interface action {
  id: string,
  label: string,
  icon?: string | { unique: string },

  type: "button" | "slider",
  current?: number | string,

  attrs?: InputHTMLAttributes<HTMLInputElement> | ButtonHTMLAttributes<HTMLButtonElement>
}
