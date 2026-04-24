import React, { useState, useEffect } from "react";

function Overview({ members }) {
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    fetchRecentCheckins();
  }, []);

  const fetchRecentCheckins = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/checkins");
      if (res.ok) {
        const result = await res.json();
        setRecentCheckins(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent check-ins:", error);
    } finally {
      setIsloading(false);
    }
  };

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.is_active).length;
  const inactiveMembers = totalMembers - activeMembers;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back. Here is what's happening at your gym today.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Live System
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <p className="text-3xl font-bold text-gray-800">{totalMembers}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl">
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Memberships
            </p>
            <p className="text-3xl font-bold text-gray-800">{activeMembers}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl">
            <UserMinus className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Inactive Accounts
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {inactiveMembers}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-800">
            Recent Gym Activity
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading traffic data...
          </div>
        ) : recentCheckins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent check-ins found today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Member Name</th>
                  <th className="p-4 font-medium">Time of Entry</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCheckins.map((entry, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {entry.first_name} {entry.last_name}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(entry.check_in_time).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Access Granted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;
