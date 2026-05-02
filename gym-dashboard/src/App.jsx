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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // fetch all members from backend
  const fetchMembers = async () => {};

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      <Toaster position="top-right" reverseOrder={false} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard />}

        {activeTab === "check-in" && <CheckInScanner />}

        {activeTab === "members" && (
          <MembersDirectory
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
            onRefresh={isModalOpen}
          />
        )}
      </main>

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
