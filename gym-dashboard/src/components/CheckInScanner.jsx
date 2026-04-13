import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function CheckInScanner() {
  const [memberId, setMemberId] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  const fetchCheckins = async () => {
    setIsLoadingCheckins(true);
    try {
      const response = await fetch("http://localhost:3000/api/checkins");
      const data = await response.json();
      if (response.ok) {
        setRecentCheckins(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching checkins:", error);
    } finally {
      setIsLoadingCheckins(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const handleCheckIn = async () => {
    if (!memberId.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid Member ID.",
      });
      return;
    }
    setStatusMessage({ type: "info", text: "Connecting to server..." });
    try {
      const response = await fetch("http://localhost:3000/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: "success", text: data.message });
        setMemberId("");
        fetchCheckins();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Access Denied.",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setStatusMessage({
        type: "error",
        text: "Cannot connect to the server.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Check-in System</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scan or Enter Member ID
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="e.g. bd0f4117-..."
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCheckIn}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Process Entry
          </button>
        </div>
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : statusMessage.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Recent Check-ins
          </h3>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
            Live
          </span>
        </div>

        {isLoadingCheckins ? (
          <div className="p-8 text-center text-gray-500">
            Loading live feed...
          </div>
        ) : recentCheckins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent check-ins found.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCheckins.map((checkin) => {
              const displayName = `${checkin.first_name || "Unknown"} ${
                checkin.last_name || ""
              }`;
              const initial = checkin.first_name
                ? checkin.first_name[0].toUpperCase()
                : "#";
              const timeString = new Date(
                checkin.check_in_time
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={checkin.checkin_id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                      {initial}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{displayName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Acceso Concedido
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {timeString}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckInScanner;
