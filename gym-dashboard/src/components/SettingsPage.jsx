import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import {
  Building2,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────

const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

const formatDuration = (months) => {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${months} month${months !== 1 ? "s" : ""}`;
};

// ─── Gym Info Section ────────────────────────────────────

function GymInfoSection() {
  const [formData, setFormData] = useState({
    gym_name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [original, setOriginal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await api.get("/settings/gym");
        const data = {
          gym_name: result.data.gym_name || "",
          address: result.data.address || "",
          phone: result.data.phone || "",
          email: result.data.email || "",
        };
        setFormData(data);
        setOriginal(data);
      } catch (err) {
        console.error("Error fetching gym settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const isDirty =
    original && JSON.stringify(formData) !== JSON.stringify(original);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.gym_name.trim()) {
      setError("Gym name is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.put("/settings/gym", {
        gym_name: formData.gym_name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
      const saved = {
        gym_name: result.data.gym_name || "",
        address: result.data.address || "",
        phone: result.data.phone || "",
        email: result.data.email || "",
      };
      setFormData(saved);
      setOriginal(saved);
      toast.success("Gym information saved");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors disabled:opacity-50";

  return (
    <section className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Gym Information
        </h3>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        Basic details about your business.
      </p>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gym Name <span className="text-red-500">*</span>
            </label>
            <input
              name="gym_name"
              value={formData.gym_name}
              onChange={handleChange}
              disabled={isSaving}
              className={inputClass}
            />
            {error && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="123 Main Street"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="787-555-1234"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="contact@gym.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
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
      )}
    </section>
  );
}

// ─── Plans Section ───────────────────────────────────────

function PlansSection() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const result = await api.get("/settings/plans/all");
      setPlans(result.data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await api.del(`/settings/plans/${planToDelete.id}`);
      toast.success("Plan deleted");
      setPlanToDelete(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Membership Plans
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Plans available when selling or renewing memberships.
          </p>
        </div>
        <button
          onClick={() => {
            setPlanToEdit(null);
            setIsModalOpen(true);
          }}
          className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-10">
          <CreditCard className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">No plans yet</p>
          <p className="text-xs text-gray-400">
            Create your first membership plan to start selling.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {plan.name}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      plan.is_active ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        plan.is_active ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {formatDuration(plan.duration_months)}
                  {plan.description ? ` · ${plan.description}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-900 tabular-nums group-hover:hidden">
                  {formatPrice(plan.price)}
                </span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPlanToEdit(plan);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPlanToEdit(null);
        }}
        onSuccess={fetchPlans}
        planToEdit={planToEdit}
      />

      <ConfirmDeleteModal
        isOpen={planToDelete !== null}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        name={planToDelete?.name}
        isLoading={isDeleting}
      />
    </section>
  );
}

// ─── Plan Modal (Create + Edit) ──────────────────────────

const EMPTY_PLAN = {
  name: "",
  price: "",
  duration_months: "",
  description: "",
  sort_order: 0,
  is_active: true,
};

function PlanModal({ isOpen, onClose, onSuccess, planToEdit }) {
  const isEditing = !!planToEdit;

  const [formData, setFormData] = useState(EMPTY_PLAN);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name || "",
        price: parseFloat(planToEdit.price),
        duration_months: planToEdit.duration_months,
        description: planToEdit.description || "",
        sort_order: planToEdit.sort_order ?? 0,
        is_active: planToEdit.is_active ?? true,
      });
    } else {
      setFormData(EMPTY_PLAN);
    }
    setErrors({});
  }, [planToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!String(formData.name).trim()) newErrors.name = "Name is required";

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) newErrors.price = "Enter a price above 0";

    const months = parseInt(formData.duration_months, 10);
    if (isNaN(months) || months < 1)
      newErrors.duration_months = "Minimum 1 month";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      name: String(formData.name).trim(),
      price: parseFloat(formData.price),
      duration_months: parseInt(formData.duration_months, 10),
      description: String(formData.description).trim(),
      sort_order: parseInt(formData.sort_order, 10) || 0,
      is_active: formData.is_active,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/settings/plans/${planToEdit.id}`, payload);
        toast.success("Plan updated");
      } else {
        await api.post("/settings/plans", payload);
        toast.success("Plan created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (hasError) =>
    `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? "border-red-300 focus:ring-red-200"
        : "border-gray-200 focus:ring-gray-900 focus:border-transparent"
    }`;

  const FieldError = ({ message }) =>
    message ? (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            {isEditing ? "Edit Plan" : "New Plan"}
          </h2>
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
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Quarterly Plan"
              className={inputClass(errors.name)}
              autoFocus
            />
            <FieldError message={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass(errors.price)}
              />
              <FieldError message={errors.price} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months) <span className="text-red-500">*</span>
              </label>
              <input
                name="duration_months"
                type="number"
                step="1"
                min="1"
                value={formData.duration_months}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass(errors.duration_months)}
              />
              <FieldError message={errors.duration_months} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Short text shown to staff"
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              name="sort_order"
              type="number"
              step="1"
              value={formData.sort_order}
              onChange={handleChange}
              disabled={isSubmitting}
              className={inputClass(false)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Lower numbers appear first.
            </p>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="plan_is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <label
                htmlFor="plan_is_active"
                className="text-sm text-gray-700 font-medium"
              >
                Plan is active (available for sale)
              </label>
            </div>
          )}

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
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Settings
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your gym information and membership plans.
        </p>
      </div>

      <div className="space-y-6">
        <GymInfoSection />
        <PlansSection />
      </div>
    </div>
  );
}

export default SettingsPage;
