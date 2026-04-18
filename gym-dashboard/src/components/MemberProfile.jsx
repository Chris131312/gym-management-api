import React, { useState } from "react";
import { X, CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function MemberProfile({ isOpen, onCLose, member, onMemberUpdated }) {
  const [memberships, setMemberships] = useState([]);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [planType, setPlanType] = useState("monthly");
  const [isLoading, setIsloading] = useState(false);
}
