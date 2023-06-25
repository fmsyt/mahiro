import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export interface componentProps {
  id: string,
  label: string,
  icon: string,

  type: "button" | "slider",
  current?: number | string,

  attrs?: InputHTMLAttributes<HTMLInputElement> | ButtonHTMLAttributes<HTMLButtonElement>
}
