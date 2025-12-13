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
    <div>
      <h2>Upload Product CSV</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">Upload CSV</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadCSVPage;
