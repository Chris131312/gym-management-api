import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/;

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0 ) return ""
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`
}
