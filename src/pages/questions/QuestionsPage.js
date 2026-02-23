import React, { useEffect, useState } from "react";
import {
  fetchAllQuestions,
  addQuestions,
  deleteQuestionById,
  fetchAllSubmissions,
} from "../../service/questions";

const QUESTION_TYPES = ["Checkbox", "Radio", "Input", "Textarea", "Dropdown"];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formRows, setFormRows] = useState([
    { question: "", type: "Input" },
  ]);
  const [error, setError] = useState(null);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    setError(null);
    try {
      const data = await fetchAllSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError("Failed to load submissions.");
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "submissions") loadSubmissions();
  }, [activeTab]);

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "—");
  const formatAmount = (n) => (n != null ? `₹${(Number(n) / 100).toFixed(2)}` : "—");

  const openAddModal = () => {
    setFormRows([{ question: "", type: "Input" }]);
    setError(null);
    setModalOpen(true);
  };

  const addFormRow = () => {
    setFormRows([...formRows, { question: "", type: "Input" }]);
  };

  const updateFormRow = (index, field, value) => {
    const next = [...formRows];
    next[index] = { ...next[index], [field]: value };
    setFormRows(next);
  };

  const removeFormRow = (index) => {
    if (formRows.length <= 1) return;
    setFormRows(formRows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = formRows
      .map((r) => ({ question: r.question.trim(), type: r.type }))
      .filter((r) => r.question !== "");
    if (payload.length === 0) {
      setError("Add at least one question with text.");
      return;
    }
    setFormLoading(true);
    setError(null);
    try {
      await addQuestions(payload);
      setModalOpen(false);
      await loadQuestions();
    } catch (err) {
      console.error("Error adding questions:", err);
      setError("Failed to add questions.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    setDeleteLoadingId(id);
    try {
      await deleteQuestionById(id);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Error deleting question:", err);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Questions</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 rounded font-medium ${activeTab === "questions" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-200"}`}
        >
          Questions
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded font-medium ${activeTab === "submissions" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-200"}`}
        >
          Submitted details
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={openAddModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add questions
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {activeTab === "questions" && (
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Question</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-12">
                  <span className="loader-spinner inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  No questions yet. Add one above.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{q.question}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                      {q.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(q._id)}
                      disabled={deleteLoadingId !== null}
                      className="px-2 py-1 rounded text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ml-auto"
                    >
                      {deleteLoadingId === q._id ? (
                        <span className="loader-spinner inline-block w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin" />
                      ) : null}
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {activeTab === "submissions" && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Answers</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-left">Razorpay Order</th>
                <th className="px-4 py-2 text-left">Razorpay Payment</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {submissionsLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <span className="loader-spinner inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-sm">{s.userId ?? "—"}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc list-inside text-sm space-y-0.5">
                        {Array.isArray(s.answers) && s.answers.length > 0
                          ? s.answers.map((a, i) => (
                              <li key={i}><strong>{a.question}</strong>: {a.answer}</li>
                            ))
                          : "—"}
                      </ul>
                    </td>
                    <td className="px-4 py-2">{formatAmount(s.amount)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${s.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {s.paymentStatus ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[120px]" title={s.razorpayOrderId}>{s.razorpayOrderId ?? "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[120px]" title={s.razorpayPaymentId}>{s.razorpayPaymentId ?? "—"}</td>
                    <td className="px-4 py-2 text-sm">{formatDate(s.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add questions</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formRows.map((row, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start border p-3 rounded bg-gray-50"
                >
                  <input
                    type="text"
                    placeholder="Question text"
                    value={row.question}
                    onChange={(e) =>
                      updateFormRow(index, "question", e.target.value)
                    }
                    className="flex-1 border p-2 rounded"
                    required={formRows.length === 1}
                  />
                  <select
                    value={row.type}
                    onChange={(e) =>
                      updateFormRow(index, "type", e.target.value)
                    }
                    className="border p-2 rounded min-w-[140px]"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={addFormRow}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Add row"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFormRow(index)}
                      disabled={formRows.length <= 1}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Remove row"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-70"
                >
                  {formLoading && (
                    <span className="loader-spinner inline-block w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin" />
                  )}
                  Add questions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .loader-spinner {
          border-top-color: transparent;
          border-left-color: transparent;
        }
      `}</style>
    </div>
  );
}
