"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const ImageUploader = ({
  onUpload,
  maxFiles = 10,
  acceptedFormats = "image/*",
  multiple = true,
  label = "Upload Images",
  description = "Drag & drop images here or click to browse",
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    // Check max files limit
    if (previews.length + files.length > maxFiles) {
      alert(
        `Maximum ${maxFiles} images allowed. You can upload ${
          maxFiles - previews.length
        } more.`
      );
      return;
    }

    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          url: e.target.result,
          file,
          id: Date.now() + Math.random(),
        });

        if (newPreviews.length === files.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
          onUpload(files);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePreview = (id) => {
    setPreviews((prev) => prev.filter((preview) => preview.id !== id));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`border rounded p-5 text-center ${
          isDragging
            ? "border-primary bg-primary bg-opacity-5"
            : "border-dashed"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        style={{ cursor: "pointer" }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleFileInput}
          className="d-none"
        />
        <div className="mb-3">
          <Upload size={48} className="text-muted mb-3" />
          <h6>{label}</h6>
          <p className="text-muted small mb-3">{description}</p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            Browse Files
          </button>
        </div>
        <p className="text-muted small mb-0">
          Maximum {maxFiles} images. Supported: JPG, PNG, WebP, GIF
        </p>
      </div>

      {previews.length > 0 && (
        <div className="mt-4">
          <h6 className="mb-3">
            Selected Images ({previews.length}/{maxFiles})
          </h6>
          <div className="row g-3">
            {previews.map((preview) => (
              <div key={preview.id} className="col-6 col-md-4 col-lg-3">
                <div className="position-relative border rounded overflow-hidden">
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="img-fluid"
                    style={{
                      height: "150px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    className="position-absolute top-0 end-0 btn btn-sm btn-danger m-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(preview.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previews.length === 0 && (
        <div className="text-center mt-3">
          <ImageIcon size={32} className="text-muted opacity-25" />
          <p className="text-muted small mt-2">No images selected</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
