import React from "react";
import { LayoutDashboard } from "lucide-react";

function Dashboard({ members, isLoadingMembers }) {
  const activeMembersCount = members.filter((m) => m.is_active).length;
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Business Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">
            Total Members
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {isLoadingMembers ? "..." : members.length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">
            Active Memberships
          </div>
          <div className="text-3xl font-bold text-green-600">
            {isLoadingMembers ? "..." : activeMembersCount}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1">
            System Status
          </div>
          <div className="text-xl font-bold text-blue-600 flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            Online & Connected
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <LayoutDashboard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">
          Welcome to Gym OS
        </h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Use the sidebar menu to scan member IDs at the front desk or manage
          your client directory.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
