import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase" // adjust path

const ImageUploader = ({ productId, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [progress, setProgress] = useState({}); // track progress per file

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!productId) {
      alert("Product ID missing!");
      return;
    }

    setUploading(true);
    try {
      const results = [];

      for (let file of selectedFiles) {
        const fileName = `${productId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `product-images/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Wait for each file upload to finish
        const url = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const prog = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgress((prev) => ({ ...prev, [file.name]: prog }));
            },
            (err) => reject(err),
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then(resolve);
            }
          );
        });

        results.push({ name: file.name, url });
      }

      setUploadedImages([...uploadedImages, ...results]);
      setSelectedFiles([]);

      if (onUploadComplete) onUploadComplete(results);
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className="p-4 sm:p-6 border-2 border-text-light/30 rounded-md bg-premium-white"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-black uppercase tracking-wider">Upload Product Images</h3>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border-2 border-text-light/30 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-black transition-colors text-black bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-premium-beige file:text-black hover:file:bg-luxury-light-gold"
      />

      {selectedFiles.length > 0 && (
        <div className="mt-3 sm:mt-4 space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider">Selected Files:</h4>
          {selectedFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between bg-premium-beige p-2 sm:p-3 rounded-md">
              <span className="text-xs sm:text-sm text-black truncate flex-1">{file.name}</span>
              <span className="text-xs sm:text-sm font-semibold text-black ml-2">
                {progress[file.name] || 0}%
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-md hover:bg-text-dark focus:outline-none focus:ring-2 focus:ring-luxury-gold font-semibold uppercase tracking-wider text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {uploadedImages.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider mb-3">Uploaded Images:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {uploadedImages.map((img, index) => (
              <div key={index} className="border-2 border-text-light/30 rounded-md overflow-hidden">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-20 sm:h-24 object-cover"
                />
                <div className="p-1 sm:p-2 bg-premium-beige">
                  <p className="text-xs text-black truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;