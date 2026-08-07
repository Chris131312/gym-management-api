import React, { useState } from "react";
import {
  Dumbbell,
  LayoutDashboard,
  ScanLine,
  Users,
  LogOut,
  Shield,
  Key,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "../api/client";
import toast from "react-hot-toast";

function Sidebar({ activeTab, setActiveTab, user, onLogout, alertCount }) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
        activeTab === id
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );

  return (
    <>
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-900 rounded-lg">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Gym OS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
                activeTab === "dashboard"
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Overview</span>
              {alertCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          )}
          <NavItem id="check-in" icon={ScanLine} label="Check-in" />
          <NavItem id="members" icon={Users} label="Members" />

          {user?.role === "admin" && (
            <>
              <div className="my-3 border-t border-gray-100" />
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Admin
              </p>
              <NavItem id="staff" icon={Shield} label="Staff" />
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-[11px] text-gray-400 capitalize">
                {user?.role || "unknown"}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-1.5 text-gray-300 hover:text-gray-900 rounded-lg transition-colors"
                title="Change Password"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-gray-300 hover:text-gray-900 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}

// ─── Change Password Modal ──────────────────────────────────

function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 8)
      newErrors.newPassword = "Minimum 8 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      toast.success("Password changed successfully");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setErrors({
        currentPassword: error.message || "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">
                Password changed successfully
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter current password"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${errors.currentPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-gray-900 focus:border-transparent"}`}
                  autoFocus
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Minimum 8 characters"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${errors.newPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-gray-900 focus:border-transparent"}`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Repeat new password"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-gray-900 focus:border-transparent"}`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
//Side Bar.jsx
