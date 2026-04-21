import React, { useEffect, useState } from "react";
import { X, CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function MemberProfile({ isOpen, onClose, member, onMemberUpdated }) {
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
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
      price = 300.0;
      planName = "Annual Plan";
    }

    const newMembership = {
      member_id: member.id,
      plan_name: planName,
      price: price,
      start_date: startDate,
      end_date: endDate.toISOString().split("T")[0],
    };

    try {
      const res = await fetch("http://localhost:3000/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMembership),
      });

      if (res.ok) {
        toast.success("Memberships renewed successfully");
        setShowRenewForm(false);
        fetchMemberships();
        onMemberUpdated();
      } else {
        toast.error("Failed to process rnewal");
      }
    } catch (error) {
      toast.error("Server connection failed");
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {member.first_name} {member.last_name}
              {member.is_active && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{member.email}</p>
            <p className="text-gray-500 text-sm">{member.phone_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showRenewForm ? (
            <button
              onClick={() => setShowRenewForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex justify-center items-center gap-2 transition-colors mb-8 shadow-sm"
            >
              <CreditCard className="w-5 h-5" />
              Renew Membership
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">Select Plan</h3>
              <form onSubmit={handleRenew}>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full mb-3 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="monthly">Monthly Plan ($30.00)</option>
                  <option value="annual">Annual Plan ($300.00)</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRenewForm(false)}
                    className="flex-1 py-2 bg-white text-gray-600 rounded-lg border border-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Process
                  </button>
                </div>
              </form>
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Payment History
          </h3>

          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading records...</p>
          ) : memberships.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">No payment history found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memberships.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">
                      {plan.plan_name}
                    </span>
                    <span className="font-bold text-green-600">
                      ${parseFloat(plan.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Starts: {new Date(plan.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 text-red-400" />
                    <span>
                      Expires: {new Date(plan.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberProfile;
