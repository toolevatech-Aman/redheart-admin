import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import imageCompression from "browser-image-compression";

// Same standard as src/comman/Image-Uploader/ImageUploader.jsx (product
// images): ≤200KB, max 1200px wide, WebP. Kept as its own small component
// rather than reusing that one directly — this is a single-image field
// with a preview and an auto-filled URL, not a multi-file gallery upload.
const compressToWebP = async (file) => {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  });
  return new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
};

// postId is optional — a not-yet-saved post uploads under "new" so the
// button works before the first save too.
export default function BlogCoverImageUploader({ postId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const webpFile = await compressToWebP(file);
      const path = `blog-images/${postId || "new"}/${Date.now()}-cover.webp`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, webpFile, {
        contentType: "image/webp",
        cacheControl: "public, max-age=31536000",
      });
      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed", null, reject, resolve);
      });
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      onUploaded(url);
    } catch (err) {
      console.error("Cover image upload failed:", err);
      setError("Upload failed — try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <label className={`text-sm px-3 py-2 rounded-lg border border-gray-300 cursor-pointer whitespace-nowrap ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}>
        {uploading ? "Uploading…" : "Upload from desktop"}
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
      </label>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
