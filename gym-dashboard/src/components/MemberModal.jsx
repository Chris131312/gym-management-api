import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

function MemberModal({ isOpen, onClose, onSuccess, memberToEdit }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    is_active: true,
  });

  const [formStatus, setFormStatus] = useState(null);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        first_name: memberToEdit.first_name || "",
        last_name: memberToEdit.last_name || "",
        email: memberToEdit.email || "",
        phone_number: memberToEdit.phone_number || "",
        is_active:
          memberToEdit.is_active !== undefined ? memberToEdit.is_active : true,
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        is_active: true,
      });
    }
    setFormStatus(null);
  }, [memberToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: "info", text: "Saving..." });

    const url = memberToEdit
      ? `http://localhost:3000/api/members/${memberToEdit.id}`
      : "http://localhost:3000/api/members";

    const method = memberToEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(memberToEdit ? "Member updated!" : "Member created");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to save member.");
      }
    } catch (error) {
      toast.error("Server connection failed");
    }
  };

  if (!isOpen) return null;

  const modalTitle = memberToEdit ? "Edit Member" : "Add New Member";
  const buttonText = memberToEdit ? "Save Changes" : "Create Member";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  required
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Active Member Account
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MemberModal;
