"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  Lock,
  Bell,
  FileText,
} from "lucide-react";
import LayoutAdmin from "@/components/layout/LayoutAdmin";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HOUSEKEEPING",
    phone: "",
    buildingId: "",
    isActive: true,
    notificationsEnabled: true,
    emailNotifications: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchBuildings();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.user) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          password: "",
          role: data.user.role || "HOUSEKEEPING",
          phone: data.user.phone || "",
          buildingId: data.user.building?.id || "",
          isActive: data.user.isActive || true,
          notificationsEnabled: true,
          emailNotifications: true,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Failed to load user data");
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          role: formData.role,
          phone: formData.phone,
          buildingId: formData.buildingId,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("User updated successfully!");
        setTimeout(() => {
          router.push(`/admin/users/${userId}`);
        }, 1500);
      } else {
        setErrorMessage(result.error || "Failed to update user");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("An error occurred while updating the user");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (loading) {
    return (
      <LayoutAdmin>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
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
                  href={`/admin/users/${userId}`}
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to User Profile</span>
                </Link>
                <h1 className="h2 mb-0 text-dark">Edit User</h1>
                <p className="text-muted mb-0">
                  Update user information and permissions
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link
                  href={`/admin/users/${userId}`}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  form="userForm"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={saving}
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

        <form id="userForm" onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Basic Information */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <User size={20} className="me-2 text-primary" />
                    Basic Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter full name"
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Mail size={16} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password (Leave blank to keep current)
                    </label>
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Key size={16} className="text-muted" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.password ? "is-invalid" : ""
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                      <small className="form-text text-muted">
                        Minimum 6 characters. Leave blank to keep current
                        password.
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Phone size={16} className="text-muted" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Role & Settings */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Shield size={20} className="me-2 text-primary" />
                    Role & Permissions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">User Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="HOUSEKEEPING">Housekeeping Staff</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Building Assignment</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Building size={16} className="text-muted" />
                      </span>
                      <select
                        name="buildingId"
                        value={formData.buildingId}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Select Building (Optional)</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name} - {building.address}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label htmlFor="isActive" className="form-check-label">
                        Active Account
                      </label>
                    </div>
                    <small className="form-text text-muted">
                      Inactive users cannot log in to the system.
                    </small>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="notificationsEnabled"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="notificationsEnabled"
                        className="form-check-label"
                      >
                        Enable In-App Notifications
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="emailNotifications"
                        className="form-check-label"
                      >
                        Enable Email Notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Bell size={20} className="me-2 text-primary" />
                    Additional Settings
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <div className="d-flex">
                      <FileText size={16} className="me-2" />
                      <small>
                        <strong>Note:</strong> Changes to user roles and
                        permissions take effect immediately. Users may need to
                        log out and log back in to see permission changes.
                      </small>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={() => {
                        // Force password reset
                        if (confirm("Send password reset email to user?")) {
                          // Implement password reset functionality
                        }
                      }}
                    >
                      <Lock size={16} className="me-2" />
                      Send Password Reset
                    </button>

                    <Link
                      href={`/admin/users/${userId}`}
                      className="btn btn-outline-secondary"
                    >
                      <ArrowLeft size={16} className="me-2" />
                      Back to Profile
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
