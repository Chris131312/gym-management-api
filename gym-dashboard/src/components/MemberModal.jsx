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
    const newErrors = {};

    if (!data.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (!NAME_REGEX.test(data.first_name.trim())) {
      newErros.first_name = "Use 2-50 letters only";
    }

    if (!data.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (!NAME_REGEX.test(data.first_name.trim())) {
      newErrors.last_name = "Use 2-50 letters only";
    }
  };

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
}

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
  const { name } = e.target
  setTouched({ ...touched, [name]: true })

  const validationErrors = validate(formData)
  setErrors(validationErrors)
}
