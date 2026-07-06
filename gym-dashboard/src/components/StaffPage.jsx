import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { Shield, UserPlus } from "lucide-react";
import RegisterUserModal from "./RegisterUserModal";

function StaffPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const result = await api.get("/auth/users");
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Staff
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${users.length} team member${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-gray-100 rounded-full" />
                      <div>
                        <div className="h-4 w-32 bg-gray-100 rounded mb-1.5" />
                        <div className="h-3 w-40 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="h-4 w-14 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-16 text-center">
                  <Shield className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    No team members yet
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Add your first staff member to get started.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-gray-900 font-medium underline underline-offset-4 hover:text-gray-600 transition-colors"
                  >
                    Add your first team member
                  </button>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Member: Avatar + Name + Email */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          user.role === "admin" ? "bg-gray-900" : "bg-gray-400"
                        }`}
                      >
                        <span className="text-white text-xs font-medium">
                          {getInitials(user.full_name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === "admin"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.is_active ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.is_active ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-gray-400">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RegisterUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}

export default StaffPage;
