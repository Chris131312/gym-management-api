import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [alerts, setAlerts] = useState(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.get("/dashboard/stats");
        setStats(result.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const result = await api.get("/dashboard/charts");
        setChartData(result.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoadingCharts(false);
      }
    };
    fetchCharts();
  }, []);

  useEffect(() => {
    const fetchRecentCheckins = async () => {
      try {
        const result = await api.get("/checkins");
        setRecentCheckins(result.data || []);
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

  const activeRate =
    totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const StatSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-20 bg-gray-100 rounded" />
      <div className="h-8 w-24 bg-gray-100 rounded" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {getGreeting()}, {user?.full_name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Total Members */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total Members</span>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {isLoadingStats ? (
            <StatSkeleton />
          ) : (
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {totalMembers}
            </p>
          )}
        </div>

        {/* Active Members */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Active</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          {isLoadingStats ? (
            <StatSkeleton />
          ) : (
            <div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {activeMembers}
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {activeRate}% of total
              </p>
            </div>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Revenue</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          {isLoadingStats ? (
            <StatSkeleton />
          ) : (
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              $
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>

        {/* Check-ins Today */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Check-ins Today</span>
            <div className="p-2 bg-violet-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-violet-500" />
            </div>
          </div>
          {isLoadingStats ? (
            <StatSkeleton />
          ) : (
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {checkinsToday}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Check-ins (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Recent Activity
            </h2>
            <span className="text-xs text-gray-400">Today</span>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Weekly Check-ins */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
                Weekly Check-ins
              </h2>
              {isLoadingCharts ? (
                <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
              ) : chartData?.weeklyCheckins?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.weeklyCheckins}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#fff",
                      }}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Check-ins"
                      fill="#111827"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-gray-400">
                    No check-in data for this week yet.
                  </p>
                </div>
              )}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
                Monthly Revenue
              </h2>
              {isLoadingCharts ? (
                <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
              ) : chartData?.monthlyRevenue?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.monthlyRevenue}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      width={50}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#fff",
                      }}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#111827"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-gray-400">
                    No revenue data available yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {isLoadingCheckins ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : recentCheckins.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No check-ins recorded yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {recentCheckins.map((checkin) => (
                <div
                  key={checkin.checkin_id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {getInitials(
                        `${checkin.first_name} ${checkin.last_name}`,
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {checkin.first_name} {checkin.last_name}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
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

        {/* Quick Stats Panel (1/3 width) */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
            Overview
          </h2>

          <div className="space-y-5">
            {/* Active Rate Visual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Active Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {isLoadingStats ? "..." : `${activeRate}%`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all duration-700"
                  style={{ width: isLoadingStats ? "0%" : `${activeRate}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="pt-4 border-t border-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-gray-500">Active</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {isLoadingStats ? "..." : activeMembers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-gray-500">Inactive</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {isLoadingStats ? "..." : inactiveMembers}
                </span>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-500">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {isLoadingStats
                  ? "..."
                  : `$${totalRevenue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
