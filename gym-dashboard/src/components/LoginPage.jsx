import React, { useState } from "react";
import { Dumbbell, Loader2, AlertCircle } from "lucide-react";
import { api } from "../api/client";
import { saveAuth } from "../../../utils/auth";

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!email.trim() || !password.trim()) {
    setError("Please enter ");
  }
};
