import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MemberModal from "./components/MemberModal";
import CheckInScanner from "./components/CheckInScanner";
import MembersDirectory from "./components/MembersDirectory";
import MemberProfile from "./components/MemberProfile";
import { Toaster } from "react-hot-toast";

function App() {
  // global app state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // fetch all members from backend
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch("http://localhost:3000/api/members");
      const data = await response.json();
      if (response.ok) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // only load data if we are looking at a view that needs it
  useEffect(() => {
    if (activeTab === "members" || activeTab === "dashboard") {
      fetchMembers();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      <Toaster position="top-right" reverseOrder={false} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <Dashboard members={members} isLoadingMembers={isLoadingMembers} />
        )}

        {activeTab === "check-in" && <CheckInScanner />}

        {activeTab === "members" && (
          <MembersDirectory
            members={members}
            isLoadingMembers={isLoadingMembers}
            onOpenModal={() => {
              setMemberToEdit(null);
              setIsModalOpen(true);
            }}
            onEditMember={(member) => {
              setMemberToEdit(member);
              setIsModalOpen(true);
            }}
            onViewProfile={(member) => {
              setSelectedMember(member);
              setIsProfileOpen(true);
            }}
            onRefresh={fetchMembers}
          />
        )}
      </main>

      {/* hidden by default, toggled from directory */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMembers}
        memberToEdit={memberToEdit}
      />

      <MemberProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={selectedMember}
        onMemberUpdated={fetchMembers}
      />
    </div>
  );
}

export default App;
