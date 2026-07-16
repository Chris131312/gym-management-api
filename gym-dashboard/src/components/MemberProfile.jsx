import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/client";
import { formatPhoneDisplay } from "../utils/format";
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
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

function MemberProfile({ isOpen, onClose, member, onMemberUpdated, userRole }) {
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("idle");
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [membershipToEdit, setMembershipToEdit] = useState(null);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      fetchMemberships();
      setStep("idle");
      setSelectedPlan("annual");
      setMembershipToEdit(null);
      setMembershipToDelete(null);
    }
  }, [isOpen, member]);

  const fetchMemberships = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/memberships/${member.id}`);
      setMemberships(data);
    } catch (error) {
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const membershipStatus = useMemo(() => {
    if (memberships.length === 0) {
      return { isActive: false, daysRemaining: 0, activeMembership: null };
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
      activeMembership: latest,
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
      await api.post("/memberships", payload);
      toast.success(`Payment of $${plan.price} processed successfully`);
      await fetchMemberships();
      setStep("idle");
      onMemberUpdated();
    } catch (error) {
      toast.error(error.message || "Failed to process payment");
      setStep("confirm");
    }
  };

  const handleDeleteMembership = async () => {
    if (!membershipToDelete) return;
    setIsDeleting(true);
    try {
      await api.del(`/memberships/${membershipToDelete.id}`);
      toast.success("Membership deleted");
      setMembershipToDelete(null);
      await fetchMemberships();
      onMemberUpdated();
    } catch (error) {
      toast.error(error.message || "Failed to delete membership");
    } finally {
      setIsDeleting(false);
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight truncate">
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-gray-400 text-sm mt-1 truncate">
              {member.email}
            </p>
            <p className="text-gray-400 text-sm">
              {formatPhoneDisplay(member.phone_number)}
            </p>
            <div className="mt-3">
              <MembershipBadge status={membershipStatus} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "idle" && (
            <button
              onClick={() => setStep("select")}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-3 rounded-xl flex justify-center items-center gap-2 transition-colors mb-8"
            >
              <CreditCard className="w-4 h-4" />
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
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 mb-8 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-3" />
              <p className="text-gray-900 text-sm font-medium">
                Processing payment...
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Please don't close this window
              </p>
            </div>
          )}

          {/* Payment History */}
          <PaymentHistory
            memberships={memberships}
            isLoading={isLoading}
            membershipStatus={membershipStatus}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            userRole={userRole}
            onEdit={(m) => setMembershipToEdit(m)}
            onDelete={(m) => setMembershipToDelete(m)}
          />
        </div>
      </div>

      {/* Edit Membership Modal */}
      {membershipToEdit && (
        <EditMembershipModal
          membership={membershipToEdit}
          onClose={() => setMembershipToEdit(null)}
          onSuccess={() => {
            setMembershipToEdit(null);
            fetchMemberships();
            onMemberUpdated();
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Delete Confirmation */}
      {membershipToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Membership
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete this membership?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
              <p className="font-medium text-gray-900">
                {membershipToDelete.plan_name}
              </p>
              <p className="text-gray-500">
                {formatCurrency(membershipToDelete.price)} ·{" "}
                {formatDate(membershipToDelete.start_date)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMembershipToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMembership}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Membership Badge ───────────────────────────────────────

function MembershipBadge({ status }) {
  if (!status.activeMembership) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        No active membership
      </span>
    );
  }

  if (!status.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Expired {Math.abs(status.daysRemaining)} days ago
      </span>
    );
  }

  if (status.daysRemaining <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Expires in {status.daysRemaining} days
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Active · {status.daysRemaining} days left
    </span>
  );
}

// ─── Plan Selector ──────────────────────────────────────────

function PlanSelector({ selectedPlan, onSelectPlan, onCancel, onContinue }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2 right-3 bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                  {plan.badge}
                </span>
              )}
              <p className="text-xs text-gray-500 capitalize mb-1">
                {plan.period}ly
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  ${plan.price}
                </span>
                <span className="text-xs text-gray-400">/ {plan.period}</span>
              </div>
              <p className="text-xs text-gray-400">{plan.description}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-[2] py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Payment Summary ────────────────────────────────────────

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
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Confirm payment
      </h3>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-400">Plan</span>
          <span className="font-medium text-gray-900">{plan.name}</span>
        </div>
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-400">Starts</span>
          <span className="font-medium text-gray-900">
            {formatDate(dates.startDate)}
          </span>
        </div>
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-gray-400">Expires</span>
          <span className="font-medium text-gray-900">
            {formatDate(dates.endDate)}
          </span>
        </div>
        <div className="flex justify-between pt-3 mt-2 text-base border-t border-gray-200">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-emerald-600">
            {formatCurrency(plan.price)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-[2] py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Confirm · {formatCurrency(plan.price)}
        </button>
      </div>
    </div>
  );
}

// ─── Payment History ────────────────────────────────────────

function PaymentHistory({
  memberships,
  isLoading,
  membershipStatus,
  formatDate,
  formatCurrency,
  userRole,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" />
        Payment History
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : memberships.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <CreditCard className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No payment history found.</p>
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
                className={`border rounded-xl p-4 transition-colors group ${
                  isCurrent
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-gray-100 bg-white hover:bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {plan.plan_name}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-600 text-sm group-hover:hidden">
                      {formatCurrency(plan.price)}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={() => onEdit(plan)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Membership"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {userRole === "admin" && (
                        <button
                          onClick={() => onDelete(plan)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Membership"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(plan.start_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(plan.end_date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Edit Membership Modal ──────────────────────────────────

function EditMembershipModal({
  membership,
  onClose,
  onSuccess,
  formatCurrency,
}) {
  const [formData, setFormData] = useState({
    plan_name: membership.plan_name || "",
    price: membership.price || "",
    start_date: membership.start_date?.split("T")[0] || "",
    end_date: membership.end_date?.split("T")[0] || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/memberships/${membership.id}`, {
        ...formData,
        price: parseFloat(formData.price),
      });
      toast.success("Membership updated");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to update membership");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Edit Membership
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              name="plan_name"
              value={formData.plan_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberProfile;
