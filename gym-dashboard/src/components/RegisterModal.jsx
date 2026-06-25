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
  };
}
