import React, { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../api/client";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  email: "",
  password: "",
  full_name: "",
  role: "receptionist",
};

function RegisterUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Minimum 8 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
      });
      toast.success(`User "${formData.full_name}" created successfully`);
      setFormData(INITIAL_FORM);
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Register New User</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="John Smith"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${errors.full_name ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                autoFocus
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="user@gym.com"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Minimum 8 characters"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
              >
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterUserModal;
