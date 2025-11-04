import React from "react";

/*
  Dropdown 简易占位：在需要复杂下拉/菜单时可替换为 shadcn 的 Dropdown/Menu
*/
export default function Dropdown({ children, className = "" }){
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}