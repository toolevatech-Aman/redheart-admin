import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Copy, Check, FileText, Download } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import * as XLSX from 'xlsx';

export default function ImageUploadPage() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState("");
  const [selectedImageType, setSelectedImageType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState({
    "1st": "",
    "2nd": "",
    "3rd": "",
    "4th": ""
  });
  const [isExporting, setIsExporting] = useState(false);

  const imageTypes = [
    { id: "1st", label: "1st Image" },
    { id: "2nd", label: "2nd Image" },
    { id: "3rd", label: "3rd Image" },
    { id: "4th", label: "4th Image" }
  ];

  const isFormValid = productId.trim() && selectedImageType;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!isFormValid || !selectedFile) {
      setError("Please fill all required fields and select an image.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadedImageUrl("");

    try {
      const fileName = `${productId}/${selectedImageType}-${Date.now()}-${selectedFile.name}`;
      const storageRef = ref(storage, `product-images/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      const url = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (err) => reject(err),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(resolve);
          }
        );
      });

      setUploadedImageUrl(url);
      setUploadedImages(prev => ({
        ...prev,
        [selectedImageType]: url
      }));
      setUploadProgress(100);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uploadedImageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = uploadedImageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setProductId("");
    setSelectedImageType("");
    setSelectedFile(null);
    setUploadedImageUrl("");
    setUploadProgress(0);
    setError("");
    setCopied(false);
    setUploadedImages({
      "1st": "",
      "2nd": "",
      "3rd": "",
      "4th": ""
    });
  };

  const exportToExcel = () => {
    if (!productId.trim()) {
      setError("Please enter a Product ID first.");
      return;
    }

    const hasAnyImage = Object.values(uploadedImages).some(url => url !== "");
    if (!hasAnyImage) {
      setError("Please upload at least one image before exporting to Excel.");
      return;
    }

    setIsExporting(true);
    setError("");

    try {
      // Prepare data for Excel
      const excelData = [
        {
          "Product ID": productId,
          "1st Image": uploadedImages["1st"] || "Not uploaded",
          "2nd Image": uploadedImages["2nd"] || "Not uploaded",
          "3rd Image": uploadedImages["3rd"] || "Not uploaded",
          "4th Image": uploadedImages["4th"] || "Not uploaded"
        }
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Product ID
        { wch: 50 }, // 1st Image
        { wch: 50 }, // 2nd Image
        { wch: 50 }, // 3rd Image
        { wch: 50 }  // 4th Image
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Product Images");

      // Generate Excel file and download
      const fileName = `Product_Images_${productId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Show success message
      setTimeout(() => {
        alert(`Excel file "${fileName}" has been downloaded successfully!`);
      }, 100);

    } catch (err) {
      console.error("Excel export failed:", err);
      setError("Failed to export Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-black mb-2">Image Upload</h1>
            <p className="text-gray-500 text-sm font-light">
              Upload product images with unique identifiers
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="bg-white border border-gray-300 text-black px-6 py-2 text-sm font-light hover:bg-gray-50 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="space-y-12">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-light text-black mb-2">Upload Configuration</h3>
            <p className="text-gray-500 text-sm font-light">Configure your image upload settings</p>
          </div>

          {/* Product ID Input */}
          <div className="space-y-2">
            <label className="block text-sm font-light text-gray-700">
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border px-4 py-3 focus:outline-none transition-colors text-gray-900 bg-white placeholder:text-gray-400 text-sm font-light border-gray-300 focus:border-black"
              placeholder="Enter unique Product ID (e.g., PID001, PRODUCT-ABC, etc.)"
              required
            />
            <p className="text-xs text-gray-500 font-light">
              You can use any convention for Product ID (alphanumeric, hyphens, underscores)
            </p>
          </div>

          {/* Image Type Radio Buttons */}
          <div className="space-y-3">
            <label className="block text-sm font-light text-gray-700">
              Image Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {imageTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center p-4 border cursor-pointer transition-colors ${
                    selectedImageType === type.id
                      ? "border-black bg-gray-50 text-black"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="imageType"
                    value={type.id}
                    checked={selectedImageType === type.id}
                    onChange={(e) => setSelectedImageType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedImageType === type.id
                        ? "border-black bg-black"
                        : "border-gray-300"
                    }`}>
                      {selectedImageType === type.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="font-light text-sm">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          {isFormValid && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-light text-gray-700">
                  Select Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border px-4 py-3 focus:outline-none transition-colors text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-light file:bg-gray-100 file:text-black hover:file:bg-gray-200 border-gray-300 focus:border-black"
                />
                <p className="text-xs text-gray-500 font-light">
                  Supported formats: JPG, PNG, GIF, WebP (Max size: 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-light text-black">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600 font-light">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-light">Type: {selectedFile.type}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full bg-black text-white px-6 py-3 text-sm font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {uploading && (
                <div className="w-full bg-gray-200 h-2">
                  <div
                    className="bg-black h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Images Summary */}
          {Object.values(uploadedImages).some(url => url !== "") && (
            <div className="bg-gray-50 border border-gray-200 p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h4 className="text-lg font-light text-black mb-2">Uploaded Images Summary</h4>
                <p className="text-gray-500 text-sm font-light">Track your uploaded images</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {imageTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 bg-white border border-gray-200">
                    <span className="font-light text-black">{type.label}:</span>
                    <span className={`text-sm px-3 py-1 font-light ${
                      uploadedImages[type.id] 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {uploadedImages[type.id] ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Excel Export Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={exportToExcel}
                  disabled={isExporting}
                  className="bg-black text-white px-6 py-3 text-sm font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isExporting ? (
                    <>
                      <FileText className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Convert to Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-red-700 text-sm font-light">{error}</p>
            </div>
          )}
{Object.values(uploadedImages).some(url => url) && (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 shadow-sm">
    <h4 className="text-lg font-medium text-gray-900 mb-5">
      Uploaded Image Links
    </h4>

    <div className="space-y-4">
      {imageTypes.map((type) => {
        const url = uploadedImages[type.id];

        return (
          <div
            key={type.id}
            className="flex items-center gap-4 rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
          >
            {/* Label */}
            <span className="text-sm font-medium text-gray-700 w-32 shrink-0">
              {type.label}
            </span>

            {/* URL / Status */}
            {url ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 truncate hover:underline"
                >
                  {url}
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="ml-auto rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-800 transition"
                >
                  Copy
                </button>
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">
                Not uploaded
              </span>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

          {/* Uploaded Image Result */}
          {uploadedImageUrl && (
            <div className="bg-green-50 border border-green-200 p-6">
              <div className="border-b border-green-200 pb-4 mb-6">
                <h4 className="text-lg font-light text-green-800 mb-2">Upload Successful!</h4>
                <p className="text-green-600 text-sm font-light">Your image has been uploaded successfully</p>
              </div>
              
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="flex justify-center">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="max-w-full h-48 object-contain border border-gray-200"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-light text-green-800">
                    Image URL:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={uploadedImageUrl}
                      readOnly
                      className="flex-1 border border-gray-300 px-3 py-2 bg-white text-sm font-mono font-light"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm font-light"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Upload Details */}
                <div className="bg-white p-4 border border-green-200">
                  <h5 className="font-light text-green-800 mb-3">Upload Details:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-light">
                    <p><span className="font-light">Product ID:</span> {productId}</p>
                    <p><span className="font-light">Image Type:</span> {selectedImageType} Image</p>
                    <p><span className="font-light">File Name:</span> {selectedFile?.name}</p>
                    <p><span className="font-light">File Size:</span> {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  {/* Upload Status for All Images */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h5 className="font-light text-green-800 mb-3">All Images Status:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {imageTypes.map((type) => (
                        <p key={type.id} className="flex items-center">
                          <span className="font-light w-20">{type.label}:</span>
                          <span className={`px-3 py-1 text-xs font-light ${
                            uploadedImages[type.id] 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {uploadedImages[type.id] ? '✓ Uploaded' : 'Not uploaded'}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-black text-white px-6 py-3 text-sm font-light hover:bg-gray-800 transition-colors"
                  >
                    Upload Another Image
                  </button>
                  <button
                    onClick={() => navigate("/products")}
                    className="flex-1 bg-white border border-gray-300 text-black px-6 py-3 text-sm font-light hover:bg-gray-50 transition-colors"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}