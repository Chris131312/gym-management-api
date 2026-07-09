import React, { useState, useEffect } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { api } from "../api/client";
import { formatPhoneDisplay } from "../utils/format";
import {
  Search,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

function MembersDirectory({
  onOpenModal,
  refreshKey,
  onEditMember,
  onViewProfile,
  userRole,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const limit = 10;

  // Debounce: wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPaginatedMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const result = await api.get(`/members?${params.toString()}`);
      setMembers(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotalMembers(result.totalMembers || 0);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchPaginatedMembers();
  }, [currentPage, refreshKey, debouncedSearch, statusFilter]);

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await api.del(`/members/${memberToDelete}`);
      setMemberToDelete(null);
      fetchPaginatedMembers();
      toast.success("Member deleted");
    } catch (error) {
      console.error("Error while deleting:", error);
      toast.error("Failed to delete member");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Members
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLoadingMembers
              ? "Loading..."
              : `${totalMembers} member${totalMembers !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "inactive"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setStatusFilter(filter);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              statusFilter === filter
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {filter === "all" ? "All Members" : filter}
          </button>
        ))}
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
                Contact
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoadingMembers ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-gray-100 rounded-full" />
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="h-4 w-40 bg-gray-100 rounded mb-1.5" />
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </td>
                  <td className="px-5 py-4 animate-pulse">
                    <div className="flex justify-end gap-1">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-16 text-center">
                  {debouncedSearch || statusFilter !== "all" ? (
                    <div>
                      <Search className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        No results found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try a different search term or filter.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        No members yet
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Get started by adding your first gym member.
                      </p>
                      <button
                        onClick={onOpenModal}
                        className="text-sm text-gray-900 font-medium underline underline-offset-4 hover:text-gray-600 transition-colors"
                      >
                        Add your first member
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {getInitials(member.first_name, member.last_name)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700">{member.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatPhoneDisplay(member.phone_number)}
                    </p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        member.is_active ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.is_active ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewProfile(member)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {userRole === "admin" && (
                        <button
                          onClick={() => setMemberToDelete(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoadingMembers && members.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="text-gray-700 font-medium">
                {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, totalMembers)}
              </span>{" "}
              of{" "}
              <span className="text-gray-700 font-medium">{totalMembers}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 px-2 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={memberToDelete !== null}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default MembersDirectory;
