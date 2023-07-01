import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export interface componentProps {
  id: string,
  label: string,
  icon: string,

  style: "button" | "slider",
  current?: number | string,

  attrs?: InputHTMLAttributes<HTMLInputElement> | ButtonHTMLAttributes<HTMLButtonElement>
}
