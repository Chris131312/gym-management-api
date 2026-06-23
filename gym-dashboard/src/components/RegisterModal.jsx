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

function RegisterUserModal({ isOpen, onClose, onSuccess }) {}
