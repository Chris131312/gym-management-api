import React, { useState, useEffect } from "react";
import { Search, X, Clock } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MemberModal from "./components/MemberModal";
import CheckInScanner from "./components/CheckInScanner";

function App() {
  //STATE
  const [activeTab, setActiveTab] = useState("dashboard");

  // Members Directory State
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch("http://localhost:3000/api/members");
      const data = await response.json();
      if (response.ok) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "members" || activeTab === "dashboard") {
      fetchMembers();
    }
  }, [activeTab]);

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

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newMember.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!newMember.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!newMember.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (newMember.phone.trim() && !/^[0-9+\-\s()]+$/.test(newMember.phone)) {
      newErrors.phone = "Phone contains invalid characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus({ type: "info", text: "Saving member..." });

    try {
      const response = await fetch("http://localhost:3000/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newMember.firstName,
          last_name: newMember.lastName,
          email: newMember.email,
          phone_number: newMember.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setNewMember({ firstName: "", lastName: "", email: "", phone: "" });
        setFormStatus(null);
        setErrors({});
        fetchMembers();
      } else {
        setFormStatus({
          type: "error",
          text: data.error || "Failed to save member.",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormStatus({ type: "error", text: "Server connection failed." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <Dashboard members={members} isLoadingMembers={isLoadingMembers} />
        )}

        {/* CHECK-IN VIEW */}
        {activeTab === "check-in" && <CheckInScanner />}

        {/* MEMBERS DIRECTORY VIEW */}
        {activeTab === "members" && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Members Directory
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                + New Member
              </button>
            </div>

            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
              />
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
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-gray-500"
                        >
                          No members match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
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
      </main>

      {/* THE MODAL OVERLAY */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMembers}
      />
    </div>
  );
}

export default App;
