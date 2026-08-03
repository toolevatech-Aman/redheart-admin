import React, { useState } from "react";
import { X } from "lucide-react";
import { createCoupon, updateCoupon } from "../../service/coupons";

const CATEGORIES = ["Flowers", "Cakes", "Plants", "Gifts", "Hampers"];

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const emptyForm = {
  code: "", description: "", discountType: "percentage", discountValue: "",
  minOrderValue: "", maxDiscount: "", usageLimitGlobal: "", usageLimitPerCustomer: "1",
  validFrom: "", validUntil: "", applicableCategories: [],
};

const CouponFormModal = ({ coupon, onClose, onSaved }) => {
  const isEdit = !!coupon;
  const [form, setForm] = useState(
    isEdit
      ? {
          code: coupon.code, description: coupon.description || "",
          discountType: coupon.discountType, discountValue: coupon.discountValue ?? "",
          minOrderValue: coupon.minOrderValue ?? "", maxDiscount: coupon.maxDiscount ?? "",
          usageLimitGlobal: coupon.usageLimitGlobal ?? "", usageLimitPerCustomer: coupon.usageLimitPerCustomer ?? "",
          validFrom: toDateInput(coupon.validFrom), validUntil: toDateInput(coupon.validUntil),
          applicableCategories: coupon.applicableCategories || [],
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggleCategory = (cat) =>
    setForm((f) => ({
      ...f,
      applicableCategories: f.applicableCategories.includes(cat)
        ? f.applicableCategories.filter((c) => c !== cat)
        : [...f.applicableCategories, cat],
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return setError("Coupon code is required");
    if (form.discountType !== "free_shipping" && !form.discountValue) return setError("Discount value is required");
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue) || 0,
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
        usageLimitGlobal: form.usageLimitGlobal === "" ? null : Number(form.usageLimitGlobal),
        usageLimitPerCustomer: form.usageLimitPerCustomer === "" ? null : Number(form.usageLimitPerCustomer),
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
      };
      const saved = isEdit ? await updateCoupon(coupon._id, payload) : await createCoupon(payload);
      onSaved(saved);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save coupon");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Coupon" : "Create Coupon"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="text-xs font-semibold text-gray-500">Coupon Code *</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="DIWALI20" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Internal Note</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Diwali campaign, Instagram ad" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Discount Type</label>
            <div className="flex gap-2 mt-1.5">
              {[{ v: "percentage", l: "Percentage" }, { v: "flat", l: "Flat ₹" }, { v: "free_shipping", l: "Free Shipping" }].map((o) => (
                <button type="button" key={o.v} onClick={() => setForm({ ...form, discountType: o.v })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                    ${form.discountType === o.v ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-300"}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {form.discountType !== "free_shipping" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  {form.discountType === "percentage" ? "Discount %" : "Discount ₹"} *
                </label>
                <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500">Max Discount ₹ (cap)</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="Uncapped" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500">Minimum Order Value ₹</label>
            <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Total Usage Limit</label>
              <input type="number" value={form.usageLimitGlobal} onChange={(e) => setForm({ ...form, usageLimitGlobal: e.target.value })}
                placeholder="Unlimited" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Per Customer Limit</label>
              <input type="number" value={form.usageLimitPerCustomer} onChange={(e) => setForm({ ...form, usageLimitPerCustomer: e.target.value })}
                placeholder="Unlimited" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Valid From</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Valid Until</label>
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Applies To (leave empty for all categories)</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button type="button" key={c} onClick={() => toggleCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                    ${form.applicableCategories.includes(c) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-300"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;
