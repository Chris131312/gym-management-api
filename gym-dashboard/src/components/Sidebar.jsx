import React from "react";
import {
  Dumbbell,
  LayoutDashboard,
  ScanLine,
  Users,
  LogOut,
  Shield,
} from "lucide-react";

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
        activeTab === id
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="p-1.5 bg-gray-900 rounded-lg">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 tracking-tight">Gym OS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {user?.role === "admin" && (
          <NavItem id="dashboard" icon={LayoutDashboard} label="Overview" />
        )}
        <NavItem id="check-in" icon={ScanLine} label="Check-in" />
        <NavItem id="members" icon={Users} label="Members" />

        {user?.role === "admin" && (
          <>
            <div className="my-3 border-t border-gray-100" />
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Admin
            </p>
            <NavItem id="staff" icon={Shield} label="Staff" />
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-[11px] text-gray-400 capitalize">
              {user?.role || "unknown"}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-gray-300 hover:text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
