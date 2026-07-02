import React, { useState } from "react";
import { isAuthenticated, getUser, clearAuth } from "./utils/auth";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MemberModal from "./components/MemberModal";
import CheckInScanner from "./components/CheckInScanner";
import MembersDirectory from "./components/MembersDirectory";
import MemberProfile from "./components/MemberProfile";
import { Toaster } from "react-hot-toast";
import StaffPage from "./components/StaffPage";

function App() {
  // Auth state
  const [user, setUser] = useState(getUser());
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  // App state
  const [activeTab, setActiveTab] = useState(
    user?.role === "admin" ? "dashboard" : "check-in",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Refresh trigger for child components
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setLoggedIn(false);
    setActiveTab("dashboard");
  };

  // If not logged in, show login page
  if (!loggedIn) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // If logged in, show the main app
  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      <Toaster position="top-right" reverseOrder={false} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard user={user} />}

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
            userRole={user?.role}
          />
        )}
        {activeTab === "staff" && <StaffPage />}
      </main>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={triggerRefresh}
        memberToEdit={memberToEdit}
      />

      <MemberProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={selectedMember}
        onMemberUpdated={triggerRefresh}
      />
    </div>
  );
}

export default App;
