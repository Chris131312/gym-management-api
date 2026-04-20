import React, { useEffect, useState } from "react";
import { X, CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function MemberProfile({ isOpen, onCLose, member, onMemberUpdated }) {
  const [memberships, setMemberships] = useState([]);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [planType, setPlanType] = useState("monthly");
  const [isLoading, setIsloading] = useState(false);

  useEffect(()=>{
    if (isOpen && member){
      fetchMemberships()
      setShowRenewForm(false)
    }
  }, [isOpen, member])

  const fetchMemberships = async () => {
    setIsloading(true)
    try{
      const res = await fetch(`http://localhost:3000/api/memberships/${member.id}`)
      if (res.ok){
        const data = await res.json()
        setMemberships(data)
      }
    } catch (error) {
      toast.error("Failed to load payment history")
    } finally {
      setIsloading(false)
    }
  }
}
