import React, { useState } from "react";
import { AddProductCSV } from "../../service/addProduct";


const UploadCSVPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [failedRows, setFailedRows] = useState([]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!file) return setMessage("Please select a CSV file.");
    setLoader(true);
    try {
      const data = await AddProductCSV(file);
      setMessage(`Uploaded! Inserted: ${data.inserted_count}, Failed: ${data.failed_count}`);
      setFailedRows(data.failed || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
      setFailedRows([]);
    }
    finally {
      setLoader(false);
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
          {file && (
            <p className="text-sm text-gray-700 text-center">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}

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
          {loader ? "Uploading..." : "Upload CSV"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center ${message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
        >
          {message}
        </p>
      )}
      {failedRows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Failed Products
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Product ID</th>
                  <th className="border px-4 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {failedRows.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {item.row?.product_id || "N/A"}
                    </td>
                    <td className="border px-4 py-2 text-red-500">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>

  );
};

export default UploadCSVPage;
