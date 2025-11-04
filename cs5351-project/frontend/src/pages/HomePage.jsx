import React from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Board from "../components/board/Board";

/*
  HomePage：页面骨架，Sidebar + Header + Board
*/
export default function HomePage(){
  return (
    <div className="h-screen flex bg-jiraLight">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-auto">
          <Board />
        </main>
      </div>
    </div>
  );
}