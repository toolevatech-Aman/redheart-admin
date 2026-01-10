import React, { useEffect, useState } from "react";
import { getAllPageContentsApi, upsertPageContentApi } from "../../service/pageContent";


const AdminPageContentEditor = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load all pages
  const fetchPages = async () => {
    setLoading(true);
    try {
      const result = await getAllPageContentsApi();
      setPages(result.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Load selected page HTML
  const handlePageSelect = (page) => {
    setSelectedPage(page.page);
    setHtmlCode(page.htmlCode || "");
    setMessage("");
  };

  // Save content
  const handleSave = async () => {
    if (!selectedPage) {
      setMessage("Select a page first");
      return;
    }
    setSaving(true);
    try {
      const result = await upsertPageContentApi(selectedPage, htmlCode);
      setMessage(result.message || "Saved successfully");
      fetchPages(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error saving content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Page Content Editor</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Page List */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-md h-[500px] overflow-y-auto">
          <h2 className="font-semibold mb-4">Pages</h2>
          {loading ? (
            <p>Loading...</p>
          ) : pages.length === 0 ? (
            <p>No pages found</p>
          ) : (
            pages.map((page) => (
              <button
                key={page._id}
                onClick={() => handlePageSelect(page)}
                className={`w-full text-left p-2 mb-2 rounded ${
                  selectedPage === page.page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100"
                }`}
              >
                {page.page}
              </button>
            ))
          )}
        </div>

        {/* HTML Editor */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Page name"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded w-full max-w-xs focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleSave}
              disabled={saving || !selectedPage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <label className="font-semibold">HTML Content:</label>
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder="Write your HTML content here..."
            className="w-full flex-1 p-4 border border-gray-300 rounded h-[500px] resize-none font-mono text-sm overflow-y-auto focus:outline-none focus:border-blue-600"
          ></textarea>

          {message && (
            <p className="text-sm text-green-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPageContentEditor;
