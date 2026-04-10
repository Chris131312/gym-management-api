import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  Users,
  Activity,
  Search,
  X,
  LayoutDashboard,
  Clock,
} from "lucide-react";

function App() {
  // STATE
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check-in State
  const [memberId, setMemberId] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  //Live Feed State
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  // Members Directory State
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [formStatus, setFormStatus] = useState(null);

  const [errors, setErrors] = useState({});

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
    if (activeTab === "members" || activeTab === "dashboard") {
      fetchMembers();
    }
  }, [activeTab]);

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

    if (!newMember.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!newMember.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

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

    if (!validateForm()) {
      return;
    }

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
      <aside className="w-64 bg-white shadow-md z-10">
        <div className="p-6 flex items-center gap-3 text-blue-600 border-b border-gray-100">
          <Dumbbell className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">Gym OS</h1>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
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
      </main>

      {/* THE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setErrors({});
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Register New Member
            </h3>

            <form onSubmit={handleAddMember} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.firstName}
                    onChange={(e) => {
                      setNewMember({ ...newMember, firstName: e.target.value });
                      if (errors.firstName)
                        setErrors({ ...errors, firstName: null });
                    }}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.lastName}
                    onChange={(e) => {
                      setNewMember({ ...newMember, lastName: e.target.value });
                      if (errors.lastName)
                        setErrors({ ...errors, lastName: null });
                    }}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => {
                    setNewMember({ ...newMember, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => {
                    setNewMember({ ...newMember, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {formStatus && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${formStatus.type === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
                >
                  {formStatus.text}
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
