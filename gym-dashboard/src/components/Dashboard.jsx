import React, { useState, useEffect } from "react";
import { Users, Activity, UserMinus, Dumbbell, Clock } from "lucide-react";

function Dashboard({ members }) {
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        setIsLoading(false);
      }
    };
    fetchRecentCheckins();
  }, []);

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
            Real-time statistics and activity for your gym.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Live System
        </div>
      </div>

      {/* Summary Cards (KPIs) */}
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
    </div>
  );
}

export default Dashboard;
