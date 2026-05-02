import React, { useEffect, useState } from "react";
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const PLANS = {
  monthly: {
    id: "monthly",
    name: "Monthly Plan",
    price: 30.0,
    period: "month",
    durationMonths: 1,
    description: "Renews monthly",
  },
  annual: {
    id: "annual",
    name: "Annual Plan",
    price: 300.0,
    period: "year",
    durationMonths: 12,
    description: "$25/month equivalent",
    badge: "Save $60",
    recommended: true,
  },
};

function MemberProfile({ isOpen, onClose, member, onMemberUpdated }) {
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [step, setStep] = useState("idle");
  const [selectedPlan, setSelectedPlan] = useState("annual");

  useEffect(() => {
    if (isOpen && member) {
      fetchMemberships();
      setStep("idle");
      setSelectedPlan("annual");
    }
  }, [isOpen, member]);

  const fetchMemberships = async () => {
    setIsloading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/memberships/${member.id}`,
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

  const membershipStatus = useMemo(() => {
    if (memberships.length === 0) {
      return { isActive: false, daysRemaining: 0, activeMemberships: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedByExpiry = [...memberships].sort(
      (a, b) => new Date(b.end_date) - new Date(a.end_date),
    );

    const latest = sortedByExpiry[0];
    const expiryDate = new Date(latest.end_date);

    const diffMs = expiryDate - today;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      isActive: daysRemaining > 0,
      daysRemaining,
      activeMemberships: latest,
    };
  }, [memberships]);

  const newPlanDates = useMemo(() => {
    const plan = PLANS[selectedPlan];
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + plan.durationMonths);

    return {
      startDate: start,
      endDate: end,
      startDateISO: start.toISOString().split("T")[0],
      endDateISO: end.toISOString().split("T")[0],
    };
  }, [selectedPlan]);

  const handleConfirmPayment = async () => {
    setStep("processing");

    const plan = PLANS[selectedPlan];
    const payload = {
      member_id: member.id,
      plan_name: plan.name,
      price: plan.price,
      start_date: newPlanDates.startDateISO,
      end_date: newPlanDates.endDateISO,
    };

    try {
      const res = await fetch("http://localhost:3000/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(`Payment of $${plan.price} processed successfully`);
        await fetchMemberships();
        setStep("idle");
        onMemberUpdated();
      } else {
        toast.error("Failed to process payment");
        setStep("confirm");
      }
    } catch (error) {
      toast.error("Server connection failed");
      setStep("confirm");
    }
  };

  if (!isOpen || !member) return null;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 truncate">
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-gray-500 text-sm mt-1 truncate">
              {member.email}
            </p>
            <p className="text-gray-500 text-sm">{member.phone_number}</p>

            <div className="mt-3">
              <MembershipBadge status={membershipStatus} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "idle" && (
            <button
              onClick={() => setStep("select")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex justify-center items-center gap-2 transition-colors mb-8 shadow-sm"
            >
              <CreditCard className="w-5 h-5" />
              {membershipStatus.isActive
                ? "Renew Membership"
                : "Sell Membership"}
            </button>
          )}

          {step === "select" && (
            <PlanSelector
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onCancel={() => setStep("idle")}
              onContinue={() => setStep("confirm")}
            />
          )}

          {step === "confirm" && (
            <PaymentSummary
              plan={PLANS[selectedPlan]}
              dates={newPlanDates}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onBack={() => setStep("select")}
              onConfirm={handleConfirmPayment}
            />
          )}

          {step === "processing" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 mb-8 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-blue-900 font-medium">Processing payment...</p>
              <p className="text-blue-700 text-sm mt-1">
                Please don't close this window
              </p>
            </div>
          )}

          <PaymentHistory
            memberships={memberships}
            isLoading={isLoading}
            membershipStatus={membershipStatus}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
}

function MembershipBadge({ status }) {
  if (!status.activeMembership) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3 h-3" />
        No active membership
      </span>
    );
  }

  if (!status.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3 h-3" />
        Expired {Math.abs(status.daysRemaining)} days ago
      </span>
    );
  }

  if (status.daysRemaining <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3 h-3" />
        Expires in {status.daysRemaining} days
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <CheckCircle className="w-3 h-3" />
      Active · Expires in {status.daysRemaining} days
    </span>
  );
}

function PlanSelector({ selectedPlan, onSelectPlan, onCancel, onContinue }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        Choose plan
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.values(PLANS).map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2 right-3 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                  {plan.badge}
                </span>
              )}
              <p className="text-xs text-gray-500 capitalize mb-1">
                {plan.period}ly
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-800">
                  ${plan.price}
                </span>
                <span className="text-xs text-gray-500">/ {plan.period}</span>
              </div>
              <p className="text-xs text-gray-500">{plan.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-[2] py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PaymentSummary({
  plan,
  dates,
  formatDate,
  formatCurrency,
  onBack,
  onConfirm,
}) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        Confirm payment
      </h3>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-gray-800">{plan.name}</span>
        </div>
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-500">Starts</span>
          <span className="font-medium text-gray-800">
            {formatDate(dates.startDate)}
          </span>
        </div>
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-500">Expires</span>
          <span className="font-medium text-gray-800">
            {formatDate(dates.endDate)}
          </span>
        </div>
        <div className="flex justify-between pt-3 mt-2 text-base border-t border-gray-200">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-bold text-green-600">
            {formatCurrency(plan.price)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Confirm payment · {formatCurrency(plan.price)}
        </button>
      </div>
    </div>
  );
}

function PaymentHistory({
  memberships,
  isLoading,
  membershipStatus,
  formatDate,
  formatCurrency,
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        Payment History
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : memberships.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No payment history found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map((plan) => {
            const isCurrent =
              membershipStatus.activeMembership?.id === plan.id &&
              membershipStatus.isActive;
            return (
              <div
                key={plan.id}
                className={`border p-4 rounded-xl transition-shadow ${
                  isCurrent
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100 bg-white hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {plan.plan_name}
                    </span>
                    {isCurrent && (
                      <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(plan.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Starts: {formatDate(plan.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 text-red-400" />
                  <span>Expires: {formatDate(plan.end_date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MemberProfile;
