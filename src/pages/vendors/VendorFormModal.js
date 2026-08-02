import React, { useState } from "react";
import { X } from "lucide-react";
import { createVendor } from "../../service/vendors";

const PRODUCTS = ["flowers", "cakes", "plants", "gifts"];
const empty = { name: "", phone: "", whatsapp: "", address: "", city: "", regions: "", pinCodes: "", products: [], notes: "" };

const VendorFormModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggleProduct = (p) =>
    setForm((f) => ({ ...f, products: f.products.includes(p) ? f.products.filter((x) => x !== p) : [...f.products, p] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) return setError("Name, phone and city are required");
    setSaving(true);
    setError(null);
    try {
      const vendor = await createVendor({
        ...form,
        regions: form.regions.split(",").map((s) => s.trim()).filter(Boolean),
        pinCodes: form.pinCodes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onCreated(vendor);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create vendor");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add Vendor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Phone *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Regions (comma-separated)</label>
            <input value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })}
              placeholder="Kozhikode Beach, Mananchira"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Pin Codes (comma-separated)</label>
            <input value={form.pinCodes} onChange={(e) => setForm({ ...form, pinCodes: e.target.value })}
              placeholder="673032, 673001"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Products Offered</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {PRODUCTS.map((p) => (
                <button type="button" key={p} onClick={() => toggleProduct(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition
                    ${form.products.includes(p) ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving…" : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorFormModal;
