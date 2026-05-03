import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/;

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
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
    const newErros = {};

    if (!data.first_name.trim()) {
      newErros.first_name = "First name is required";
    } else if (!NAME_REGEX.test(data.first_name.trim())) {
      newErros.first_name = "Use 2-50 letters only";
    }
  };
}
