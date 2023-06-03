import React, { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import { action } from "../interface";

interface propsTypes {
  action: action,
  webSocket?: WebSocket
}

const Slider = (props: propsTypes) => {

  const isInputHTMLAttributes = useCallback(function(attrs: any): attrs is InputHTMLAttributes<HTMLInputElement> {

    if (!attrs) {
      return false;
    }

    return true;

  }, []);

  const buttonAttrs = useCallback((action: action) => {

    const overlap: InputHTMLAttributes<HTMLInputElement> = {
      type: "range",
      onChange: function(e: ChangeEvent) {},
      defaultValue: action.current,
    };

    const attrs = isInputHTMLAttributes(action.attrs) ? action.attrs : {};

    return { ...attrs, ...overlap };

  }, [isInputHTMLAttributes]);


  return (
    <div>
      <input type="range" {...buttonAttrs(props.action)} />
    </div>
  )
}

export default Slider;
