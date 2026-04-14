import React, { useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Search, Trash2 } from "lucide-react";

function MembersDirectory({
  members,
  isLoadingMembers,
  onOpenModal,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToDelete, setMemberToDelete] = useState(null);

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
        }
      );

      if (response.ok) {
        setMemberToDelete(null);
        onRefresh();
      } else {
        alert("Failed to delete member. Please try again.");
      }
    } catch (error) {
      console.error("Network error while deleting:", error);
      alert("Cannot connect to server.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
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
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
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
                    <td className="p-4 text-gray-600">{member.phone_number}</td>
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
                    <td className="p-4 text-right">
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
