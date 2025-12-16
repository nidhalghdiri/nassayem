"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  ArrowLeft,
  Save,
  Shield,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Key,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import LayoutAdmin from "@/components/layout/LayoutAdmin";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
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
    sendWelcomeEmail: true,
  });

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

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Phone validation (optional)
    if (formData.phone && !/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("User created successfully!");

        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "HOUSEKEEPING",
          phone: "",
          buildingId: "",
          isActive: true,
          sendWelcomeEmail: true,
        });
        setErrors({});

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      } else {
        setErrorMessage(result.error || "Failed to create user");

        // Set specific field errors if provided by API
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(
        "An error occurred while creating the user. Please try again."
      );
    } finally {
      setLoading(false);
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
      <div className="form-container">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert-message">
            <div
              className="alert alert-success alert-dismissible fade show d-flex align-items-center"
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
          </div>
        )}

        {errorMessage && (
          <div className="alert-message">
            <div
              className="alert alert-danger alert-dismissible fade show d-flex align-items-center"
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
          </div>
        )}

        <div className="form-main p-4">
          {/* Header */}
          <div className="form-header mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
              <div>
                <Link
                  href="/admin/users"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Users</span>
                </Link>
                <h1 className="h2 mb-2 text-dark">Add New User</h1>
                <p className="text-muted mb-0">
                  Create a new team member account
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link href="/admin/users" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  form="userForm"
                  disabled={loading}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Main Form */}
            <div className="col-lg-8">
              <form id="userForm" onSubmit={handleSubmit}>
                {/* User Information Card */}
                <div className="card form-card mb-4">
                  <div className="card-header d-flex align-items-center">
                    <UserPlus size={20} className="me-2 text-primary" />
                    <h2 className="h5 mb-0 text-dark">Basic Information</h2>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.name
                              ? "is-invalid"
                              : formData.name
                              ? "is-valid"
                              : ""
                          }`}
                          placeholder="Enter full name"
                          required
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                        {formData.name && !errors.name && (
                          <div className="valid-feedback">Looks good!</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address *
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <Mail size={16} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-control ${
                              errors.email
                                ? "is-invalid"
                                : formData.email
                                ? "is-valid"
                                : ""
                            }`}
                            placeholder="user@example.com"
                            required
                          />
                        </div>
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                        {formData.email && !errors.email && (
                          <div className="valid-feedback">
                            Valid email address
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="password" className="form-label">
                          Password *
                        </label>
                        <div className="position-relative">
                          <div className="input-group">
                            <span className="input-group-text">
                              <Key size={16} className="text-muted" />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`form-control ${
                                errors.password
                                  ? "is-invalid"
                                  : formData.password
                                  ? "is-valid"
                                  : ""
                              }`}
                              placeholder="Enter password"
                              required
                            />
                            <button
                              type="button"
                              className="btn password-toggle"
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
                          {formData.password && !errors.password && (
                            <div className="valid-feedback">
                              Strong password
                            </div>
                          )}
                          <small className="form-text text-muted">
                            Minimum 6 characters
                          </small>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone Number
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <Phone size={16} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-control ${
                              errors.phone
                                ? "is-invalid"
                                : formData.phone
                                ? "is-valid"
                                : ""
                            }`}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                        {formData.phone && !errors.phone && (
                          <div className="valid-feedback">
                            Valid phone number
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role & Permissions Card */}
                <div className="card form-card mb-4">
                  <div className="card-header d-flex align-items-center">
                    <Shield size={20} className="me-2 text-primary" />
                    <h2 className="h5 mb-0 text-dark">Role & Permissions</h2>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="role" className="form-label">
                          User Role *
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="form-select"
                          required
                        >
                          <option value="HOUSEKEEPING">
                            Housekeeping Staff
                          </option>
                          <option value="RECEPTIONIST">Receptionist</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="DIRECTOR">Director</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="buildingId" className="form-label">
                          Assign Building (Optional)
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <Building size={16} className="text-muted" />
                          </span>
                          <select
                            id="buildingId"
                            name="buildingId"
                            value={formData.buildingId}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="">Select Building</option>
                            {buildings.map((building) => (
                              <option key={building.id} value={building.id}>
                                {building.name} - {building.address}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Role Permissions Info */}
                    <div className="role-permissions mt-4">
                      <h6 className="mb-3 text-white">Role Permissions:</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="role-permission-item">
                            <div className="role-permission-dot bg-success"></div>
                            <span className="small">
                              Housekeeping: Clean units, update task status
                            </span>
                          </div>
                          <div className="role-permission-item">
                            <div className="role-permission-dot bg-info"></div>
                            <span className="small">
                              Receptionist: Manage bookings, assign tasks
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="role-permission-item">
                            <div className="role-permission-dot bg-warning"></div>
                            <span className="small">
                              Supervisor: Oversee teams, escalate issues
                            </span>
                          </div>
                          <div className="role-permission-item">
                            <div className="role-permission-dot bg-danger"></div>
                            <span className="small">
                              Director: Full system access, analytics
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings Card */}
                <div className="card form-card">
                  <div className="card-header">
                    <h2 className="h5 mb-0 text-dark">Account Settings</h2>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="form-check-input"
                          />
                          <label
                            htmlFor="isActive"
                            className="form-check-label"
                          >
                            Activate account immediately
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="sendWelcomeEmail"
                          className="form-label"
                        >
                          Welcome Email
                        </label>
                        <select
                          id="sendWelcomeEmail"
                          name="sendWelcomeEmail"
                          value={formData.sendWelcomeEmail}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="true">
                            Send welcome email with login instructions
                          </option>
                          <option value="false">
                            Don't send welcome email
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar Guide */}
            <div className="col-lg-4 guide-sidebar">
              <div
                className="card form-card sticky-top"
                style={{ top: "20px" }}
              >
                <div className="card-header">
                  <h3 className="h5 mb-0 text-dark">
                    <Info size={20} className="me-2 text-primary" />
                    Quick Guide
                  </h3>
                </div>
                <div className="card-body">
                  <div className="guide-card blue p-3 rounded">
                    <h6 className="fw-bold text-primary mb-2">
                      Required Fields
                    </h6>
                    <p className="small text-muted mb-0">
                      Name, Email, and Password are required fields. Make sure
                      to provide valid information.
                    </p>
                  </div>

                  <div className="guide-card green p-3 rounded">
                    <h6 className="fw-bold text-success mb-2">
                      Role Selection
                    </h6>
                    <p className="small text-muted mb-0">
                      Choose the appropriate role based on the user's
                      responsibilities in the system.
                    </p>
                  </div>

                  <div className="guide-card yellow p-3 rounded">
                    <h6 className="fw-bold text-warning mb-2">Password Tips</h6>
                    <p className="small text-muted mb-0">
                      Use a strong password with mix of letters, numbers, and
                      special characters.
                    </p>
                  </div>

                  <div className="guide-card purple p-3 rounded">
                    <h6 className="fw-bold text-purple mb-2">After Creation</h6>
                    <p className="small text-muted mb-0">
                      User will receive login credentials and can start using
                      the system immediately.
                    </p>
                  </div>

                  <div className="alert alert-info mt-3 small">
                    <strong>Note:</strong> All users will be able to access the
                    system based on their assigned role permissions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
