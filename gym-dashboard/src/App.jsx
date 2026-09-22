import React, { useState, useEffect } from "react";
import { initTheme } from "./utils/theme";
import { isAuthenticated, getUser, clearAuth } from "./utils/auth";
import { api } from "./api/client";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MemberModal from "./components/MemberModal";
import CheckInScanner from "./components/CheckInScanner";
import MembersDirectory from "./components/MembersDirectory";
import MemberProfile from "./components/MemberProfile";
import StaffPage from "./components/StaffPage";
import AuditLogPage from "./components/AuditLogPage";
import { Toaster } from "react-hot-toast";

// Initialize theme before render
initTheme();

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

  // Alert count for sidebar badge
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!loggedIn || user?.role !== "admin") return;

    const fetchAlertCount = async () => {
      try {
        const result = await api.get("/dashboard/alerts");
        setAlertCount(result.data?.totalAlerts || 0);
      } catch (error) {
        console.error("Error fetching alert count:", error);
      }
    };

    fetchAlertCount();
  }, [loggedIn, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setLoggedIn(true);
    setActiveTab(userData?.role === "admin" ? "dashboard" : "check-in");
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
        alertCount={alertCount}
      />

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && user?.role === "admin" && (
          <Dashboard user={user} />
        )}

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
            refreshKey={refreshKey}
            userRole={user?.role}
          />
        )}

        {activeTab === "staff" && user?.role === "admin" && (
          <StaffPage currentUserId={user?.id} />
        )}

        {activeTab === "audit" && user?.role === "admin" && <AuditLogPage />}
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
        userRole={user?.role}
      />
    </div>
  );
}

export default App;
