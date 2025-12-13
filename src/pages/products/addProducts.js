import React, { useState } from "react";
import { AddProductCSV } from "../../service/addProduct";


const UploadCSVPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a CSV file.");

    try {
      const data = await AddProductCSV(file);
      setMessage(`Uploaded! Inserted: ${data.inserted_count}, Failed: ${data.failed_count}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  return (
  <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">
  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Product CSV</h2>
  <form
    onSubmit={handleSubmit}
    className="flex flex-col space-y-4"
  >
    <label className="flex flex-col items-center px-4 py-6 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition">
      <span className="text-blue-700 font-medium">Click to select CSV file</span>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>

    <button
      type="submit"
      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
    >
      Upload CSV
    </button>
  </form>

  {message && (
    <p
      className={`mt-4 text-center ${
        message.includes("success") ? "text-green-600" : "text-red-600"
      }`}
    >
      {message}
    </p>
  )}
</div>

  );
};

export default UploadCSVPage;
