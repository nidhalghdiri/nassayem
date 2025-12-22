"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
  Upload,
  X,
  AlertCircle,
  Building,
  Check,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Wrench,
  Sparkles,
} from "lucide-react";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import UnitStatusBadge from "@/components/units/UnitStatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ImageUploader from "@/components/ui/ImageUploader";

// Validation schema
const unitSchema = {
  title: { required: true, minLength: 3, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 2000 },
  price: { required: true, min: 1, max: 1000000 },
  bedrooms: { required: true, min: 1, max: 20 },
  bathrooms: { required: true, min: 1, max: 20 },
  area: { required: true, min: 10, max: 5000 },
  floor: { required: true },
};

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [amenities, setAmenities] = useState([]);

  // Unit status options - MATCHING YOUR PRISMA SCHEMA
  const unitStatusOptions = [
    { value: "AVAILABLE", label: "Available", color: "success" },
    { value: "RENTED", label: "Rented", color: "info" },
    { value: "MAINTENANCE", label: "Maintenance", color: "warning" },
    { value: "UNAVAILABLE", label: "Unavailable", color: "secondary" },
  ];

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
  const [unitTasks, setUnitTasks] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Predefined amenities list - SIMPLE STRINGS (matching API expectation)
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

  // Fetch unit data
  useEffect(() => {
    if (unitId) {
      fetchUnitData();
      fetchBuildings();
    }
  }, [unitId]);

  const fetchUnitData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/units/${unitId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Unit Data: ", data);
        setFormData({
          title: data.unit?.title || "",
          description: data.unit?.description || "",
          price: data.unit?.price || "",
          location: data.unit?.location || "",
          floor: data.unit?.floor || "",
          bedrooms: data.unit?.bedrooms || 1,
          bathrooms: data.unit?.bathrooms || 1,
          area: data.unit?.area || "",
          status: data.unit?.status || "AVAILABLE",
          buildingId: data.unit?.buildingId || "",
        });

        setExistingImages(data.unit?.images || []);
        setAmenities(data.unit?.amenities || []);

        // Fetch unit tasks and inspections
        fetchUnitTasks();
        fetchRecentInspections();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to load unit data");
        // router.push("/admin/units");
      }
    } catch (error) {
      console.error("Error fetching unit:", error);
      setErrorMessage("Error loading unit data");
    } finally {
      setLoading(false);
    }
  };

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

  const fetchUnitTasks = async () => {
    try {
      const response = await fetch(`/api/units/${unitId}/tasks?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setUnitTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchRecentInspections = async () => {
    try {
      const response = await fetch(`/api/units/${unitId}/inspections?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRecentInspections(data.inspections || []);
      }
    } catch (error) {
      console.error("Error fetching inspections:", error);
    }
  };

  // Handle image upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    if (newFiles.length + newImageFiles.length > 10) {
      setErrorMessage("Maximum 10 new images allowed");
      return;
    }
    setNewImageFiles((prev) => [...prev, ...newFiles]);
  };

  const removeExistingImage = async (imageUrl) => {
    if (!confirm("Are you sure you want to remove this image?")) return;

    try {
      // Remove from existing images
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
      setSuccessMessage("Image removed");

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to remove image");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
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

    Object.keys(unitSchema).forEach((key) => {
      const rule = unitSchema[key];
      const value = formData[key];

      if (rule.required && !value) {
        newErrors[key] = "This field is required";
      } else if (rule.minLength && value.length < rule.minLength) {
        newErrors[key] = `Minimum ${rule.minLength} characters required`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[key] = `Maximum ${rule.maxLength} characters allowed`;
      } else if (rule.min && parseFloat(value) < rule.min) {
        newErrors[key] = `Minimum value is ${rule.min}`;
      } else if (rule.max && parseFloat(value) > rule.max) {
        newErrors[key] = `Maximum value is ${rule.max}`;
      }
    });

    if (!formData.buildingId) {
      newErrors.buildingId = "Building selection is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fix the errors in the form");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // In a real app, you would upload images to a storage service here
      // For now, we'll just use the existing images
      const uploadedImageUrls = [...existingImages];

      // Add new image files (in real app, these would be uploaded to storage first)
      if (newImageFiles.length > 0) {
        console.log("New images would be uploaded here:", newImageFiles);
        // Note: In production, upload to Supabase Storage or Cloudinary
        // and add URLs to uploadedImageUrls
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        floor: formData.floor.trim(),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        status: formData.status,
        buildingId: formData.buildingId,
        images: uploadedImageUrls,
        amenities: amenities,
      };

      // Update unit
      const response = await fetch(`/api/units/${unitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Unit updated successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/units");
        }, 2000);
      } else {
        setErrorMessage(result.error || "Failed to update unit");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating unit:", error);
      setErrorMessage("An error occurred while updating the unit");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = (type) => {
    router.push(`/admin/tasks/new?unitId=${unitId}&type=${type}`);
  };

  const handleViewTask = (taskId) => {
    router.push(`/admin/tasks/${taskId}`);
  };

  const handleCreateInspection = () => {
    router.push(`/admin/inspections/new?unitId=${unitId}`);
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="container-fluid py-5">
          <div className="row">
            <div className="col-12 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-muted">Loading unit data...</p>
            </div>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

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
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h2 mb-0 text-dark">Edit Unit</h1>
                  <UnitStatusBadge status={formData.status} />
                </div>
                <p className="text-muted mb-0">
                  {formData.buildingId &&
                    buildings.find((b) => b.id === formData.buildingId)
                      ?.name}{" "}
                  • {formData.floor && `Floor ${formData.floor}`}
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link
                  href={`/admin/units/${unitId}`}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                >
                  <Eye size={16} />
                  View
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
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

        <div className="row">
          {/* Left Column - Edit Form */}
          <div className="col-lg-8">
            <form id="unitForm" onSubmit={handleSubmit}>
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
                        {unitStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
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
                          step="1"
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

              {/* Images */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <ImageIcon size={20} className="me-2 text-primary" />
                    Unit Images ({existingImages.length + newImageFiles.length}
                    /10)
                  </h5>
                </div>
                <div className="card-body">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">
                        Existing Images ({existingImages.length})
                      </h6>
                      <div className="row g-3">
                        {existingImages.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="position-relative border rounded overflow-hidden">
                              <img
                                src={image}
                                alt={`Unit image ${index + 1}`}
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
                                onClick={() => removeExistingImage(image)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Uploader Component */}
                  <div className="mb-4">
                    <h6 className="mb-3">Add New Images</h6>
                    <ImageUploader
                      onUpload={handleImageUpload}
                      maxFiles={10 - existingImages.length}
                      acceptedFormats="image/*"
                      label="Upload New Images"
                      description="Drag & drop new images here or click to browse"
                    />
                  </div>

                  {/* New Images Preview */}
                  {newImageFiles.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3">
                        New Images to Upload ({newImageFiles.length})
                      </h6>
                      <div className="row g-3">
                        {Array.from(newImageFiles).map((file, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="position-relative border rounded overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New image ${index + 1}`}
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
                                onClick={() => removeNewImage(index)}
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

              {/* Amenities */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <CheckCircle size={20} className="me-2 text-primary" />
                    Amenities ({amenities.length})
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {amenitiesList.map((amenity, index) => (
                      <div key={index} className="col-6 col-md-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id={`amenity-${index}`}
                            checked={amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="form-check-input"
                          />
                          <label
                            htmlFor={`amenity-${index}`}
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
            </form>
          </div>

          {/* Right Column - Tasks & Actions */}
          <div className="col-lg-4">
            {/* Quick Actions */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateTask("CLEANING")}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                  >
                    <Sparkles size={16} />
                    Create Cleaning Task
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateTask("MAINTENANCE")}
                    className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-2"
                  >
                    <Wrench size={16} />
                    Create Maintenance Task
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateInspection}
                    className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2"
                  >
                    <Check size={16} />
                    Create Inspection
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Tasks</h5>
                <Link
                  href={`/admin/tasks?unitId=${unitId}`}
                  className="btn btn-sm btn-link"
                >
                  View All
                </Link>
              </div>
              <div className="card-body">
                {unitTasks.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {unitTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleViewTask(task.id)}
                        className="list-group-item list-group-item-action border-0 px-0 py-2"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{task.title}</h6>
                            <small className="text-muted">
                              {task.type} • {task.status}
                            </small>
                          </div>
                          <Clock size={16} className="text-muted" />
                        </div>
                        {task.dueDate && (
                          <small className="text-muted">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center mb-0">No tasks found</p>
                )}
              </div>
            </div>

            {/* Recent Inspections */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Recent Inspections</h5>
              </div>
              <div className="card-body">
                {recentInspections.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentInspections.map((inspection) => (
                      <div
                        key={inspection.id}
                        className="list-group-item border-0 px-0 py-2"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">Inspection</h6>
                            <span
                              className={`badge bg-${
                                inspection.status === "passed"
                                  ? "success"
                                  : inspection.status === "failed"
                                  ? "danger"
                                  : "warning"
                              }`}
                            >
                              {inspection.status || "pending"}
                            </span>
                          </div>
                          <Calendar size={16} className="text-muted" />
                        </div>
                        <small className="text-muted">
                          {new Date(inspection.createdAt).toLocaleDateString()}{" "}
                          • {inspection.inspector?.name}
                        </small>
                        {inspection.notes && (
                          <p className="mt-1 mb-0 small">{inspection.notes}</p>
                        )}
                        {inspection.score && (
                          <div className="mt-1">
                            <small className="text-muted">
                              Score: {inspection.score}/100
                            </small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center mb-0">
                    No recent inspections
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
