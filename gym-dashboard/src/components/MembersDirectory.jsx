import React, { useState, useEffect } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { formatPhoneDisplay } from "../utils/format";
import {
  Search,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

function MembersDirectory({
  onOpenModal,
  onRefresh,
  onEditMember,
  onViewProfile,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToDelete, setMemberToDelete] = useState(null);

  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchPaginatedMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/members?page=${currentPage}&limit=${limit}`,
      );
      if (response.ok) {
        const result = await response.json();
        setMembers(result.data || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchPaginatedMembers();
  }, [currentPage]);

  useEffect(() => {
    fetchPaginatedMembers();
  }, [onRefresh]);

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name || ""} ${
      member.last_name || ""
    }`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (member.email && member.email.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/members/${memberToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setMemberToDelete(null);
        fetchPaginatedMembers();
      } else {
        alert("Failed to delete member. Please try again.");
      }
    } catch (error) {
      console.error("Network error while deleting:", error);
      alert("Cannot connect to server.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Members Directory</h2>
        <button
          onClick={onOpenModal}
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold w-1/4">Name</th>
              <th className="p-4 font-semibold w-1/4">Email</th>
              <th className="p-4 font-semibold w-1/5">Phone</th>
              <th className="p-4 font-semibold w-[15%]">Status</th>
              <th className="p-4 font-semibold text-right w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingMembers ? (
              [...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-50 animate-pulse"
                >
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </td>
                </tr>
              ))
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    {searchTerm ? (
                      <>
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No matches found
                        </h3>
                        <p className="text-gray-500">
                          We couldn't find any member matching "{searchTerm}"
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                          <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No members yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Get started by adding your first gym member to the
                          directory.
                        </p>
                        <button
                          onClick={onOpenModal}
                          className="bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                          Add New Member
                        </button>
                      </>
                    )}
                  </div>
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
                    {formatPhoneDisplay(member.phone_number)}
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
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => onEditMember(member)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Member"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onViewProfile(member)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setMemberToDelete(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoadingMembers && members.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
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
