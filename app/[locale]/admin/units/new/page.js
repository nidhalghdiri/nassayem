"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Save,
  Home,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Check,
  Trash2,
} from "lucide-react";

export default function NewUnitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    floor: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    status: "AVAILABLE",
    buildingId: "",
  });

  const [errors, setErrors] = useState({});

  // Predefined amenities list
  const amenitiesList = [
    "WiFi",
    "Air Conditioning",
    "Heating",
    "TV",
    "Kitchen",
    "Refrigerator",
    "Microwave",
    "Coffee Maker",
    "Washer",
    "Dryer",
    "Parking",
    "Swimming Pool",
    "Gym",
    "Security",
    "Balcony",
    "Elevator",
    "Pet Friendly",
    "Smoke Free",
    "Wheelchair Access",
  ];

  // Fetch buildings for dropdown
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch("/api/buildings");
      if (response.ok) {
        const data = await response.json();
        setBuildings(data.buildings || []);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      setErrorMessage("Maximum 10 images allowed");
      return;
    }

    const newImages = [];
    const newImageFiles = [...imageFiles];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
      newImageFiles.push(file);
    });

    setImageFiles(newImageFiles);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle drag and drop for images
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      if (files.length + images.length > 10) {
        setErrorMessage("Maximum 10 images allowed");
        return;
      }

      const newImages = [];
      const newImageFiles = [...imageFiles];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
        newImageFiles.push(file);
      });

      setImageFiles(newImageFiles);
    }
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.floor.trim()) {
      newErrors.floor = "Floor is required";
    }

    if (!formData.bedrooms || formData.bedrooms < 1) {
      newErrors.bedrooms = "At least 1 bedroom is required";
    }

    if (!formData.bathrooms || formData.bathrooms < 1) {
      newErrors.bathrooms = "At least 1 bathroom is required";
    }

    if (
      !formData.area ||
      isNaN(formData.area) ||
      parseFloat(formData.area) <= 0
    ) {
      newErrors.area = "Valid area is required";
    }

    if (!formData.buildingId) {
      newErrors.buildingId = "Building selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseInt(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Prepare unit data - images will be uploaded separately
      const unitData = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseInt(formData.area),
        images: [], // Empty array for now - will be updated after upload
        amenities: amenities,
      };

      // Create unit
      const response = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unitData),
      });

      const result = await response.json();

      if (response.ok) {
        // If there are images, upload them
        if (imageFiles.length > 0) {
          // Note: In a real app, you would upload images to a storage service
          // and then update the unit with the image URLs
          console.log("Images would be uploaded here:", imageFiles);
        }

        setSuccessMessage("Unit created successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/units");
        }, 2000);
      } else {
        setErrorMessage(result.error || "Failed to create unit");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      setErrorMessage("An error occurred while creating the unit");
    } finally {
      setSaving(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <LayoutAdmin>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div className="mb-3 mb-md-0">
                <Link
                  href="/admin/units"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Units</span>
                </Link>
                <h1 className="h2 mb-0 text-dark">Add New Unit</h1>
                <p className="text-muted mb-0">Create a new property listing</p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link href="/admin/units" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  form="unitForm"
                  disabled={saving}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Create Unit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4"
            role="alert"
          >
            <CheckCircle className="me-2" size={20} />
            <div>{successMessage}</div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage("")}
            ></button>
          </div>
        )}

        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4"
            role="alert"
          >
            <AlertCircle className="me-2" size={20} />
            <div>{errorMessage}</div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMessage("")}
            ></button>
          </div>
        )}

        <form id="unitForm" onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Basic Information */}
            <div className="col-lg-8">
              {/* Basic Information */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Home size={20} className="me-2 text-primary" />
                    Basic Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unit Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.title ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., Luxury Apartment with Sea View"
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Building *</label>
                      <select
                        name="buildingId"
                        value={formData.buildingId}
                        onChange={handleChange}
                        className={`form-select ${
                          errors.buildingId ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Select Building</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name} - {building.address}
                          </option>
                        ))}
                      </select>
                      {errors.buildingId && (
                        <div className="invalid-feedback">
                          {errors.buildingId}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Floor *</label>
                      <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.floor ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., 3rd Floor"
                      />
                      {errors.floor && (
                        <div className="invalid-feedback">{errors.floor}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="RENTED">Rented</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        rows="4"
                        placeholder="Describe the unit features, location advantages, etc."
                      />
                      {errors.description && (
                        <div className="invalid-feedback">
                          {errors.description}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <MapPin size={16} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.location ? "is-invalid" : ""
                          }`}
                          placeholder="e.g., 123 Main St, City, State"
                        />
                      </div>
                      {errors.location && (
                        <div className="invalid-feedback">
                          {errors.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Specifications */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Home size={20} className="me-2 text-primary" />
                    Unit Specifications
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bedrooms *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Bed size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          min="1"
                          max="20"
                          className={`form-control ${
                            errors.bedrooms ? "is-invalid" : ""
                          }`}
                        />
                      </div>
                      {errors.bedrooms && (
                        <div className="invalid-feedback">
                          {errors.bedrooms}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bathrooms *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Bath size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          min="1"
                          max="20"
                          className={`form-control ${
                            errors.bathrooms ? "is-invalid" : ""
                          }`}
                        />
                      </div>
                      {errors.bathrooms && (
                        <div className="invalid-feedback">
                          {errors.bathrooms}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Area (m²) *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Maximize2 size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          min="1"
                          className={`form-control ${
                            errors.area ? "is-invalid" : ""
                          }`}
                          placeholder="e.g., 120"
                        />
                      </div>
                      {errors.area && (
                        <div className="invalid-feedback">{errors.area}</div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Price ($) *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <DollarSign size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="1"
                          step="0.01"
                          className={`form-control ${
                            errors.price ? "is-invalid" : ""
                          }`}
                          placeholder="e.g., 150"
                        />
                      </div>
                      {errors.price && (
                        <div className="invalid-feedback">{errors.price}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Upload */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <ImageIcon size={20} className="me-2 text-primary" />
                    Unit Images ({images.length}/10)
                  </h5>
                </div>
                <div className="card-body">
                  <div
                    className="border rounded p-5 text-center"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("imageUpload").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="d-none"
                    />
                    <div className="mb-3">
                      <Upload size={48} className="text-muted mb-3" />
                      <h6>Drag & Drop Images Here</h6>
                      <p className="text-muted small mb-3">
                        or click to browse
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("imageUpload").click();
                        }}
                      >
                        Browse Files
                      </button>
                    </div>
                    <p className="text-muted small mb-0">
                      Upload up to 10 images. Supported formats: JPG, PNG, WebP
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3">
                        Selected Images ({images.length}/10)
                      </h6>
                      <div className="row g-3">
                        {images.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="position-relative border rounded overflow-hidden">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
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
                                  removeImage(index);
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
                </div>
              </div>
            </div>

            {/* Right Column - Amenities & Sidebar */}
            <div className="col-lg-4">
              {/* Amenities */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <CheckCircle size={20} className="me-2 text-primary" />
                    Amenities ({amenities.length})
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="col-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            checked={amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="form-check-input"
                          />
                          <label
                            htmlFor={`amenity-${amenity}`}
                            className="form-check-label"
                          >
                            {amenity}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Guide */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Quick Guide</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info small mb-3">
                    <strong>Tip:</strong> Add clear, high-quality images to
                    attract more bookings.
                  </div>

                  <div className="alert alert-warning small mb-3">
                    <strong>Note:</strong> Make sure all information is accurate
                    before saving.
                  </div>

                  <div className="d-grid gap-2">
                    <Link
                      href="/admin/units"
                      className="btn btn-outline-secondary"
                    >
                      <ArrowLeft size={16} className="me-2" />
                      Back to Units
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </LayoutAdmin>
  );
}
