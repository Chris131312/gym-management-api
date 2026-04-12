import React from "react";
import { Dumbbell, LayoutDashboard, Activity, Users } from "lucide-react";

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="2-64 bg-white shadow-md z-10 flex flex-col">
      <div className="p-6 flex items-center gap-3 text-blue-600 border-b border-gray-100">
        <Dumbbell className="w-8 h-8" />
        <h1 className="text-xl font-bold text-gray-800">Gym OS</h1>
      </div>

      <nav className="mt-6 flex flex-col gap-2 px-4 flex-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600 " : "text-gray-600 hover:bg-gray-50"}`}
        >
          <LayoutDashboard className="w-5 h-5" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("check-in")}
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "check-in" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <Activity className="w-5 h-5" /> Check-in Scanner
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "members" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <Users className="w-5 h-5" /> Members Directory
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
