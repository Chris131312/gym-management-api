import React, { use, useEffect, useState } from "react";
import { Dumbbell, Users, CreditCard, Activity, Search } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("check-in");
  const [memberId, setMemberId] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: memberId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: "success", text: data.message });
        setMemberId("");
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
        text: "Cannot connect to the server. Is Node.js running on port 3000?",
      });
    }
  };

  //FETCH ALL MEMBERS
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch("http://localhost:3000/api/members");
      const data = await response.json();
      if (response.ok) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab]);

  const filteredMembers = members.filter((member) => {
    const fulName = `${member.first_name} ${member.last_name}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return fulName.includes(searchLower) || member.email.toLowerCase().includes(searchLower)
  })

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 flex items-center gap-3 text-blue-600 border-b border-gray-100">
          <Dumbbell className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">Gym OS</h1>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
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
          <button
            onClick={() => setActiveTab("memberships")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "memberships" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <CreditCard className="w-5 h-5" /> Memberships
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* CHECK-IN VIEW */}
        {activeTab === "check-in" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Check-in System
            </h2>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Process Entry
                </button>
              </div>
              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm font-medium ${statusMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : statusMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                >
                  {statusMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NEW: MEMBERS VIEW */}
        {activeTab === "members" && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Members Directory
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + New Member
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {isLoadingMembers ? (
                <div className="p-8 text-center text-gray-500">
                  Loading members from database...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-gray-500"
                        >
                          No members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="p-4 font-medium text-gray-800">
                            {member.first_name} {member.last_name}
                          </td>
                          <td className="p-4 text-gray-600">{member.email}</td>
                          <td className="p-4 text-gray-600">
                            {member.phone_number}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MEMBERSHIPS VIEW */}
        {activeTab === "memberships" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Point of Sale</h2>
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
