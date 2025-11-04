import React from "react";

/*
  Button wrapper（简易），如果你已使用 shadcn 真实组件，请替换导入
*/
export default function Button({ children, className = "", ...props }){
  return (
    <button
      className={`inline-flex items-center justify-center px-3 py-1 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}