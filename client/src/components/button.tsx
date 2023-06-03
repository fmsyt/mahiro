import React, { ButtonHTMLAttributes, useCallback } from "react";
import { action } from "../interface";
import { control } from "../functions";

interface propsTypes {
  action: action,
  webSocket?: WebSocket
}

const Button = (props: propsTypes) => {

  const { action, webSocket } = props;

  const isButtonHTMLAttributes = useCallback(function(attrs: any): attrs is ButtonHTMLAttributes<HTMLButtonElement> {

    if (!attrs) {
      return false;
    }

    return true;

  }, []);

  const buttonAttrs = useCallback((action: action) => {

    const overlap: ButtonHTMLAttributes<HTMLButtonElement> = {
      type: "button",
      onClick: () => {
        webSocket && control(webSocket, action);
      }
    };

    const attrs = isButtonHTMLAttributes(action.attrs) ? action.attrs : {};

    return { ...attrs, ...overlap };

  }, [webSocket, isButtonHTMLAttributes]);


  return (
    <div>
      <button {...buttonAttrs(props.action)}>{action.label}</button>
    </div>
  )
}

export default Button;
