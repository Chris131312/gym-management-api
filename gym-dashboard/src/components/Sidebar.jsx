import React from "react";
import {
  Dumbbell,
  LayoutDashboard,
  Activity,
  Users,
  LogOut,
  Shield,
} from "lucide-react";

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <aside className="w-64 bg-white shadow-md z-10 flex flex-col">
      <div className="p-6 flex items-center gap-3 text-blue-600 border-b border-gray-100">
        <Dumbbell className="w-8 h-8" />
        <h1 className="text-xl font-bold text-gray-800">Gym OS</h1>
      </div>

      <nav className="mt-6 flex flex-col gap-2 px-4 flex-1">
        {user?.role === "admin" && (
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
        )}
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
        {user?.role === "admin" && (
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "staff" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Shield className="w-5 h-5" /> Staff
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "unknown"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-3 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
