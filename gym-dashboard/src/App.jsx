import React, { useState } from "react";
import { Dumbbell, Users, CreditCard, Activity } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("check-in");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 flex items-center gap-3 text-blue-600 boder-b border-gray-100">
          <Dumbbell className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">Gym OS</h1>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
          <button
            onClick={() => setActiveTab("check-in")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "check-in" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Activity className="w-5 h-5" />
            Check-in Scanner
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "members" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Users className="w-5 h-5" />
            Members Directory
          </button>

          <button
            onClick={() => setActiveTab("memberships")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "memberships" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <CreditCard className="w-5 h-5" />
            Memberships
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        {activeTab === "check-in" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Check-in System
            </h2>

            {/* Scanner Input Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan or Enter Member ID
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="e.g. bd0f4117-..."
                  className="flex-1 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Process Entry
                </button>
              </div>
            </div>

            {/* Recent Activity Table*/}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700">
                  Recent Check-ins
                </h3>
              </div>
              <div className="p-6 text-center text-gray-500">
                Connecting to database...
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS VIEW*/}
        {activeTab === "members" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Members Directory
            </h2>
            <p className="text-gray-600 mt-2">
              Member list will rendered here.
            </p>
          </div>
        )}

        {/* MEMBERSHIPS VIEW*/}
        {activeTab === "memberships" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Point of Sale</h2>.
            <p className="text-gray-600 mt-2">
              Membership purchasing will be rendered here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
