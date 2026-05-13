import React, { useEffect, useState } from "react";
import {
    createAddOn,
    editAddOn,
    softDeleteAddOn,
    fetchAllAddOns,
} from "../../service/addOn";

const ADDON_CATEGORIES = [
    { label: "Flower",        icon: "🌸" },
    { label: "Cake Toppers",  icon: "🎂" },
    { label: "Greeting Card", icon: "💌" },
    { label: "Cake",          icon: "🍰" },
    { label: "Teddy",         icon: "🧸" },
    { label: "Chocolates",    icon: "🍫" },
    { label: "Plants",        icon: "🌿" },
    { label: "Candles",       icon: "🕯️" },
    { label: "Gifts",         icon: "🎁" },
];

const EMPTY_FORM = {
    image: "",
    categories: [],
    name: "",
    costPrice: "",
    sellingPrice: "",
    originalPrice: "",
    addOn: true,
    isBestSeller: false,
};

export default function AddOnManager() {
    const [addOns, setAddOns] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const loadAddOns = async () => {
        setLoading(true);
        try {
            const data = await fetchAllAddOns();
            setAddOns(data);
        } catch (err) {
            console.error("Error loading AddOns:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAddOns(); }, []);

    const openModal = (addOn = null) => {
        setEditingAddOn(addOn);
        if (addOn) {
            // Support old single `category` string + new `categories` array
            const cats = Array.isArray(addOn.categories) && addOn.categories.length > 0
                ? addOn.categories
                : addOn.category ? [addOn.category] : [];
            setFormData({ ...EMPTY_FORM, ...addOn, categories: cats });
        } else {
            setFormData(EMPTY_FORM);
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Toggle a category in/out of the categories array
    const toggleCategory = (cat) => {
        setFormData((prev) => {
            const exists = prev.categories.includes(cat);
            return {
                ...prev,
                categories: exists
                    ? prev.categories.filter((c) => c !== cat)
                    : [...prev.categories, cat],
                addOn: true, // always true if in any category
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.categories.length === 0) {
            alert("Please select at least one category.");
            return;
        }
        setFormLoading(true);
        try {
            const payload = { ...formData, category: formData.categories[0] }; // keep backward compat
            if (editingAddOn) {
                await editAddOn(editingAddOn._id, payload);
            } else {
                await createAddOn(payload);
            }
            setModalOpen(false);
            await loadAddOns();
        } catch (err) {
            console.error("Error saving AddOn:", err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this AddOn?")) return;
        setLoading(true);
        try {
            await softDeleteAddOn(id);
            await loadAddOns();
        } catch (err) {
            console.error("Error deleting AddOn:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">AddOn Manager</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    + Add AddOn
                </button>
            </div>

            {/* AddOns Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Categories</th>
                            <th className="px-4 py-2">Selling Price</th>
                            <th className="px-4 py-2">Original Price</th>
                            <th className="px-4 py-2">Best Seller</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-6">
                                    <span className="loader-border inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></span>
                                </td>
                            </tr>
                        ) : addOns.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">No AddOns found.</td>
                            </tr>
                        ) : (
                            addOns.map((a) => {
                                const cats = Array.isArray(a.categories) && a.categories.length > 0
                                    ? a.categories
                                    : a.category ? [a.category] : [];
                                return (
                                    <tr key={a._id} className={`border-b ${a.softDelete ? "bg-red-100 text-red-700" : "bg-white"}`}>
                                        <td className="px-4 py-2">
                                            <img src={a.image} alt={a.name} className={`w-16 h-16 object-cover rounded ${a.softDelete ? "opacity-50" : ""}`} />
                                        </td>
                                        <td className="px-4 py-2 font-medium">{a.name}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {cats.map((cat) => {
                                                    const found = ADDON_CATEGORIES.find(c => c.label === cat);
                                                    return (
                                                        <span key={cat} className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full font-medium">
                                                            {found ? found.icon : ""} {cat}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">₹{a.sellingPrice}</td>
                                        <td className="px-4 py-2">{a.originalPrice ? `₹${a.originalPrice}` : "—"}</td>
                                        <td className="px-4 py-2">
                                            {a.isBestSeller ? (
                                                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded">✓ Best Seller</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 space-x-2">
                                            <button onClick={() => openModal(a)} className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
                                            {!a.softDelete && (
                                                <button onClick={() => handleDelete(a._id)} disabled={loading} className={`px-2 py-1 rounded text-white ${loading ? "bg-red-300" : "bg-red-500 hover:bg-red-600"}`}>Delete</button>
                                            )}
                                            {a.softDelete && (
                                                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded">Deleted</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingAddOn ? "Edit AddOn" : "Create AddOn"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input type="text" name="image" value={formData.image} onChange={handleChange} className="border p-2 rounded w-full" required />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="border p-2 rounded w-full" required />
                            </div>

                            {/* Prices */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Cost Price</label>
                                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="border p-2 rounded w-full" required />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Selling Price</label>
                                    <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="border p-2 rounded w-full" required />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Original Price</label>
                                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="border p-2 rounded w-full" />
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Add to Categories <span className="text-red-500">*</span>
                                    <span className="text-gray-400 font-normal ml-1">(tick all that apply)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ADDON_CATEGORIES.map((cat) => {
                                        const isChecked = formData.categories.includes(cat.label);
                                        return (
                                            <label
                                                key={cat.label}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                                    isChecked
                                                        ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCategory(cat.label)}
                                                    className="accent-red-500"
                                                />
                                                <span>{cat.icon}</span>
                                                <span className="text-sm">{cat.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {formData.categories.length === 0 && (
                                    <p className="text-xs text-red-400 mt-1">Select at least one category</p>
                                )}
                            </div>

                            {/* Best Seller */}
                            <div>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isBestSeller"
                                        checked={formData.isBestSeller}
                                        onChange={handleChange}
                                        className="accent-teal-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Mark as Best Seller</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border" disabled={formLoading}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2" disabled={formLoading}>
                                    {formLoading && <span className="loader-border inline-block w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin"></span>}
                                    {editingAddOn ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`.loader-border { border-top-color: transparent; border-left-color: transparent; }`}</style>
        </div>
    );
}
