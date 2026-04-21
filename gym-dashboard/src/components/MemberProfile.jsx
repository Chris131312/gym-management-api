import React, { useEffect, useState } from "react";
import { X, CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function MemberProfile({ isOpen, onCLose, member, onMemberUpdated }) {
  const [memberships, setMemberships] = useState([]);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [planType, setPlanType] = useState("monthly");
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      fetchMemberships();
      setShowRenewForm(false);
    }
  }, [isOpen, member]);

  const fetchMemberships = async () => {
    setIsloading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/memberships/${member.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch (error) {
      toast.error("Failed to load payment history");
    } finally {
      setIsloading(false);
    }
  };

  const handleRenew = async (e) => {
    e.preventDefault();

    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    let endDate = newDate();
    let price = 0;
    let planName = "";

    if (planType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
      price = 30.0;
      planName = "Monthly Plan";
    }
  };
}
