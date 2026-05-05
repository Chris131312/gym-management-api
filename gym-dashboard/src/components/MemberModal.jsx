import React, { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/;

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const INITIAL_FORM_STATE = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  is_active: true,
};

function MemberModal({ isOpen, onClose, onSuccess, memberToEdit }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        first_name: memberToEdit.first_name || "",
        last_name: memberToEdit.last_name || "",
        email: memberToEdit.email || "",
        phone_number: formatPhone(memberToEdit.phone_number || ""),
        is_active:
          memberToEdit.is_active !== undefined ? memberToEdit.is_active : true,
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [memberToEdit, isOpen]);

  const validate = (data) => {
    const newErrors = {};

    if (!data.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (!NAME_REGEX.test(data.first_name.trim())) {
      newErrors.first_name = "Use 2-50 letters only";
    }

    if (!data.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (!NAME_REGEX.test(data.last_name.trim())) {
      newErrors.last_name = "Use 2-50 letters only";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    const phoneDigits = data.phone_number.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone_number = "Phone is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone_number = "Phone must be 10 digits";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;
    if (name === "phone_number") {
      processedValue = formatPhone(value);
    }

    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    };
    setFormData(newFormData);

    if (touched[name]) {
      const validationErrors = validate(newFormData);
      setErrors(validationErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });

    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSubmitting(true);

    const url = memberToEdit
      ? `http://localhost:3000/api/members/${memberToEdit.id}`
      : "http://localhost:3000/api/members";
    const method = memberToEdit ? "PUT" : "POST";

    const payload = {
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.replace(/\D/g, ""),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = memberToEdit ? "Edit Member" : "Add New Member";
  const buttonText = memberToEdit ? "Save Changes" : "Create Member";

  const shouldShowError = (fieldName) =>
    touched[fieldName] && errors[fieldName];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={shouldShowError("first_name") ? errors.first_name : null}
                required
                autoFocus
                disabled={isSubmitting}
              />
              <FormField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={shouldShowError("last_name") ? errors.last_name : null}
                required
                disabled={isSubmitting}
              />
            </div>

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={shouldShowError("email") ? errors.email : null}
              required
              disabled={isSubmitting}
              placeholder="member@example.com"
            />

            <FormField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                shouldShowError("phone_number") ? errors.phone_number : null
              }
              required
              disabled={isSubmitting}
              placeholder="(787) 555-1234"
              hint="10 digits, will be formatted automatically"
            />

            <div className="flex items-start gap-3 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700 cursor-pointer block"
                >
                  Active Member Account
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Inactive members cannot check in to the gym.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  placeholder,
  hint,
  autoFocus,
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full border rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
      />

      {error ? (
        <p
          id={errorId}
          className="mt-1 text-xs text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default MemberModal;
