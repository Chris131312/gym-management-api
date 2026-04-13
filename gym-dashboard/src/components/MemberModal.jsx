import React, { useStateß } from "react";
import { X } from "lucide-react";
import { use } from "react";

function MemberModal({ isOpen, onClose, onSuccess }) {
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [formStatus, setFormStatus] = useState(null);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!newMember.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!newMember.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!newMember.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (newMember.phone.trim() && !/^[0-9+\-\s()]+$/.test(newMember.phone)) {
      newErrors.phone = "Phone contains invalid characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus({ type: "info", text: "Saving member..." });

    try {
      const response = await fetch("http://localhost:3000/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newMember.firstName,
          last_name: newMember.lastName,
          email: newMember.email,
          phone_number: newMember.phone,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setNewMember({ firstName: "", lastName: "", email: "", phone: "" });
        setFormStatus(null);
        setErrors({});
        onClose();
        onSuccess();
      } else {
        setFormStatus({
          type: "error",
          text: data.error || "Failed to save member.",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormStatus({ type: "error", text: "Server connection failed." });
    }
  };
  const handleClose = () => {
    onClose();
    setErrors({});
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Register New Member
        </h3>
        <form onSubmit={handleAddMember} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={newMember.firstName}
                onChange={(e) => {
                  setNewMember({ ...newMember, firstName: e.target.value });
                  if (errors.firstName)
                    setErrors({ ...errors, firstName: null });
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={newMember.lastName}
                onChange={(e) => {
                  setNewMember({ ...newMember, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: null });
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => {
                setNewMember({ ...newMember, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={newMember.phone}
              onChange={(e) => {
                setNewMember({ ...newMember, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-colors ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          {formStatus && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${formStatus.type === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
            >
              {formStatus.text}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberModal;
