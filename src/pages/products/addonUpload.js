import React, { useEffect, useState } from "react";
import {
    createAddOn,
    editAddOn,
    softDeleteAddOn,
    fetchAllAddOns,
    fetchAddOnsByCategory,
} from "../../service/addOn";

export default function AddOnManager() {
    const [addOns, setAddOns] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState(null);
    const [formData, setFormData] = useState({
        image: "",
        category: "",
        name: "",
        costPrice: "",
        sellingPrice: "",
        originalPrice: "",
        addOn: true,
    });
    const [loading, setLoading] = useState(false); // loader for main table
    const [formLoading, setFormLoading] = useState(false); // loader for form submit

    // Fetch all addOns (admin view)
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

    useEffect(() => {
        loadAddOns();
    }, []);

    // Fetch by category (public)
    const handleCategoryFilter = async () => {
        setLoading(true);
        try {
            if (categoryFilter.trim() === "") {
                await loadAddOns();
                return;
            }
            const data = await fetchAddOnsByCategory(categoryFilter);
            setAddOns(data);
        } catch (err) {
            console.error("Error filtering by category:", err);
        } finally {
            setLoading(false);
        }
    };

    // Open modal for create/edit
    const openModal = (addOn = null) => {
        setEditingAddOn(addOn);
        setFormData(
            addOn || {
                image: "",
                category: "",
                name: "",
                costPrice: "",
                sellingPrice: "",
                originalPrice: "",
                addOn: true,
            }
        );
        setModalOpen(true);
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingAddOn) {
                await editAddOn(editingAddOn._id, formData);
            } else {
                await createAddOn(formData);
            }
            setModalOpen(false);
            await loadAddOns();
        } catch (err) {
            console.error("Error saving AddOn:", err);
        } finally {
            setFormLoading(false);
        }
    };

    // Soft delete
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
            <h1 className="text-3xl font-bold mb-4">AddOn Manager</h1>

            {/* Filter */}
            <div className="flex items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Filter by category..."
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border p-2 rounded w-64"
                />
                <button
                    onClick={handleCategoryFilter}
                    disabled={loading}
                    className={`px-4 py-2 rounded ${loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                >
                    {loading ? <span className="loader-border inline-block w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin"></span> : "Filter"}
                </button>
                <button
                    onClick={() => openModal()}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-auto"
                >
                    + Add AddOn
                </button>
            </div>

            {/* AddOns Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Cost Price</th>
                            <th className="px-4 py-2">Selling Price</th>
                            <th className="px-4 py-2">Original Price</th>
                            <th className="px-4 py-2">AddOn</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-6">
                                    <span className="loader-border inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></span>
                                </td>
                            </tr>
                        ) : addOns.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No AddOns found.
                                </td>
                            </tr>
                        ) : (
                            addOns.map((a) => (
                                <tr
                                    key={a._id}
                                    className={`border-b ${a.softDelete ? "bg-red-100 text-red-700" : "bg-white"
                                        }`}
                                >
                                    <td className="px-4 py-2">
                                        <img
                                            src={a.image}
                                            alt={a.name}
                                            className={`w-16 h-16 object-cover rounded ${a.softDelete ? "opacity-50" : ""
                                                }`}
                                        />
                                    </td>

                                    <td className="px-4 py-2">{a.category}</td>
                                    <td className="px-4 py-2 font-medium">{a.name}</td>

                                    <td className="px-4 py-2">{a.costPrice}</td>
                                    <td className="px-4 py-2">{a.sellingPrice}</td>
                                    <td className="px-4 py-2">{a.originalPrice}</td>

                                    <td className="px-4 py-2">
                                        {a.addOn ? "Yes" : "No"}
                                    </td>

                                    <td className="px-4 py-2 space-x-2">
                                        {/* Edit button always visible */}
                                        <button
                                            onClick={() => openModal(a)}
                                            className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                                        >
                                            Edit
                                        </button>

                                        {/* Show Delete button ONLY if not soft deleted */}
                                        {!a.softDelete && (
                                            <button
                                                onClick={() => handleDelete(a._id)}
                                                disabled={loading}
                                                className={`px-2 py-1 rounded text-white ${loading
                                                        ? "bg-red-300"
                                                        : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                            >
                                                Delete
                                            </button>
                                        )}

                                        {/* Deleted badge */}
                                        {a.softDelete && (
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded">
                                                Deleted
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))

                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded w-full max-w-lg relative">
                        <h2 className="text-xl font-bold mb-4">
                            {editingAddOn ? "Edit AddOn" : "Create AddOn"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block">Cost Price</label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block">Selling Price</label>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block">Original Price</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="addOn"
                                        checked={formData.addOn}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    Is AddOn?
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded border"
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                                    disabled={formLoading}
                                >
                                    {formLoading && (
                                        <span className="loader-border inline-block w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin"></span>
                                    )}
                                    {editingAddOn ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loader Tailwind spinner class */}
            <style>{`
        .loader-border {
          border-top-color: transparent;
          border-left-color: transparent;
        }
      `}</style>
        </div>
    );
}
