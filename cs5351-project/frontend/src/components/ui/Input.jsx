import React from "react";

/*
  Input wrapper（简易）
*/
export default function Input({ className = "", ...props }){
  return (
    <input
      className={`border rounded px-3 py-2 text-sm ${className}`}
      {...props}
    />
  );
}