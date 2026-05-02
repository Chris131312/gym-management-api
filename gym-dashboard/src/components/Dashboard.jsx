import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  UserMinus,
  Dumbbell,
  Clock,
  DollarSign,
} from "lucide-react";

function Dashboard({ members }) {
  const [stats, setStats] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/dashboard/stats");
        if (res.ok) {
          const result = await res.json();
          setStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

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
        setIsLoadingCheckins(false);
      }
    };
    fetchRecentCheckins();
  }, []);

  const totalMembers = stats?.totalMembers ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const inactiveMembers = totalMembers - activeMembers;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const checkinsToday = stats?.checkinsToday ?? 0;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-800">{totalMembers}</p>
            )}
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
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-800">
                {activeMembers}
              </p>
            )}
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
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-800">
                {inactiveMembers}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl">
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            {isLoadingStats ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-800">
                $
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Check-ins Today
            {!isLoadingStats && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-sm font-medium px-2 py-0.5 rounded-full">
                {checkinsToday}
              </span>
            )}
          </h2>
        </div>

        {isLoadingCheckins ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : recentCheckins.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No check-ins recorded yet today.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentCheckins.map((checkin) => (
              <div
                key={checkin.checkin_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <span className="font-medium text-gray-700">
                  {checkin.first_name} {checkin.last_name}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(checkin.check_in_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
