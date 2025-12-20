"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  FileText,
  Users as UsersIcon,
  Home,
  Wrench,
} from "lucide-react";
import LayoutAdmin from "../../../../../components/layout/LayoutAdmin";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [userStats, setUserStats] = useState({
    createdTasks: 0,
    assignedTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inspections: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HOUSEKEEPING",
    phone: "",
    buildingId: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch user data and buildings
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
        });

        // Set user statistics
        if (data.user._count) {
          setUserStats({
            createdTasks: data.user._count.createdTasks || 0,
            assignedTasks: data.user._count.assignedTasks || 0,
            completedTasks: 0, // You might need to calculate this
            pendingTasks: 0, // You might need to calculate this
            inspections: data.user._count.inspections || 0,
          });
        }
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

  // Validation functions
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

    // Only validate password if editing and password field is not empty
    if (editing && formData.password && formData.password.length < 6) {
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
          ...formData,
          // Don't send password if it's empty
          ...(formData.password ? { password: formData.password } : {}),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("User updated successfully!");
        setEditing(false);
        // Clear password field after successful update
        setFormData((prev) => ({ ...prev, password: "" }));

        // Refresh user data
        fetchUserData();
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

  const handleToggleStatus = async () => {
    const newStatus = !formData.isActive;
    const confirmMessage = newStatus
      ? "Are you sure you want to activate this user?"
      : "Are you sure you want to deactivate this user?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        setFormData((prev) => ({ ...prev, isActive: newStatus }));
        setSuccessMessage(
          `User ${newStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setErrorMessage("An error occurred while updating user status");
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

  // Role descriptions
  const roleDescriptions = {
    HOUSEKEEPING: {
      color: "success",
      description:
        "Cleans units, updates task status, creates maintenance requests",
      icon: Wrench,
    },
    RECEPTIONIST: {
      color: "info",
      description: "Manages bookings, assigns tasks, creates inspections",
      icon: UsersIcon,
    },
    SUPERVISOR: {
      color: "warning",
      description: "Oversees teams, escalates issues, performs quality control",
      icon: Shield,
    },
    DIRECTOR: {
      color: "danger",
      description: "Full system access, analytics, team management",
      icon: Activity,
    },
    ADMIN: {
      color: "purple",
      description: "Complete system control, user management, settings",
      icon: Shield,
    },
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const roleInfo =
    roleDescriptions[formData.role] || roleDescriptions.HOUSEKEEPING;

  return (
    <LayoutAdmin>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div className="mb-3 mb-md-0">
                <Link
                  href="/admin/users"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Users</span>
                </Link>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h2 mb-0 text-dark">{formData.name}</h1>
                  <span
                    className={`badge bg-${
                      formData.isActive ? "success" : "danger"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-muted mb-0">User profile and management</p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <button
                  className={`btn btn-${
                    formData.isActive ? "outline-danger" : "outline-success"
                  }`}
                  onClick={handleToggleStatus}
                  disabled={saving}
                >
                  {formData.isActive ? (
                    <>
                      <XCircle size={16} className="me-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      Activate
                    </>
                  )}
                </button>

                {editing ? (
                  <>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setErrors({});
                        fetchUserData(); // Reset form data
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
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
                  </>
                ) : (
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setEditing(true)}
                  >
                    <Edit size={16} />
                    Edit User
                  </button>
                )}
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
          {/* Left Column - User Details & Stats */}
          <div className="col-lg-8">
            <form id="userForm" onSubmit={handleSubmit}>
              {/* User Information Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <User size={20} className="me-2 text-primary" />
                    User Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Full Name{" "}
                        {!editing && <span className="text-muted">:</span>}
                      </label>
                      {editing ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-control ${
                              errors.name ? "is-invalid" : ""
                            }`}
                            placeholder="Enter full name"
                          />
                          {errors.name && (
                            <div className="invalid-feedback">
                              {errors.name}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="form-control-plaintext fw-semibold">
                          {formData.name}
                        </p>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email Address{" "}
                        {!editing && <span className="text-muted">:</span>}
                      </label>
                      {editing ? (
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
                          />
                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <Mail size={16} className="me-2 text-muted" />
                          <span className="form-control-plaintext fw-semibold">
                            {formData.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {editing && (
                      <div className="col-md-6 mb-3">
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
                    )}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Phone Number{" "}
                        {!editing && <span className="text-muted">:</span>}
                      </label>
                      {editing ? (
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
                      ) : (
                        <div className="d-flex align-items-center">
                          <Phone size={16} className="me-2 text-muted" />
                          <span className="form-control-plaintext fw-semibold">
                            {formData.phone || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Role {!editing && <span className="text-muted">:</span>}
                      </label>
                      {editing ? (
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="HOUSEKEEPING">
                            Housekeeping Staff
                          </option>
                          <option value="RECEPTIONIST">Receptionist</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="DIRECTOR">Director</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      ) : (
                        <div className="d-flex align-items-center">
                          <Shield size={16} className="me-2 text-muted" />
                          <span className={`badge bg-${roleInfo.color} me-2`}>
                            {formData.role.replace(/_/g, " ")}
                          </span>
                          <span className="form-control-plaintext">
                            {roleInfo.description}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Building Assignment{" "}
                        {!editing && <span className="text-muted">:</span>}
                      </label>
                      {editing ? (
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
                      ) : (
                        <div className="d-flex align-items-center">
                          <Building size={16} className="me-2 text-muted" />
                          <span className="form-control-plaintext fw-semibold">
                            {formData.buildingId
                              ? buildings.find(
                                  (b) => b.id === formData.buildingId
                                )?.name || "Unknown Building"
                              : "Not assigned"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* User Statistics */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Activity size={20} className="me-2 text-primary" />
                  User Statistics
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card bg-primary bg-opacity-10 border-0">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <FileText size={24} className="text-primary" />
                        </div>
                        <h3 className="mb-1">{userStats.createdTasks}</h3>
                        <p className="text-muted mb-0 small">Tasks Created</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-success bg-opacity-10 border-0">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <UsersIcon size={24} className="text-success" />
                        </div>
                        <h3 className="mb-1">{userStats.assignedTasks}</h3>
                        <p className="text-muted mb-0 small">Tasks Assigned</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-info bg-opacity-10 border-0">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <Home size={24} className="text-info" />
                        </div>
                        <h3 className="mb-1">{userStats.inspections}</h3>
                        <p className="text-muted mb-0 small">Inspections</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Info & Activity */}
          <div className="col-lg-4">
            {/* Account Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Shield size={20} className="me-2 text-primary" />
                  Account Information
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">
                    Account Status
                  </label>
                  <div className="d-flex align-items-center">
                    {formData.isActive ? (
                      <>
                        <CheckCircle size={16} className="me-2 text-success" />
                        <span className="fw-semibold text-success">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="me-2 text-danger" />
                        <span className="fw-semibold text-danger">
                          Inactive
                        </span>
                      </>
                    )}
                    <span className="ms-auto">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleToggleStatus}
                      >
                        Change
                      </button>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">
                    Account Created
                  </label>
                  <div className="d-flex align-items-center">
                    <Calendar size={16} className="me-2 text-muted" />
                    <span className="fw-semibold">
                      {formatDate(formData.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">
                    Last Login
                  </label>
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="me-2 text-muted" />
                    <span className="fw-semibold">
                      {formatDate(formData.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Shield size={20} className="me-2 text-primary" />
                  Role Permissions
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <span className={`badge bg-${roleInfo.color} mb-2`}>
                    {formData.role.replace(/_/g, " ")}
                  </span>
                  <p className="small text-muted mb-0">
                    {roleInfo.description}
                  </p>
                </div>

                <div className="border-top pt-3">
                  <h6 className="small fw-semibold mb-2">Permissions:</h6>
                  <ul className="list-unstyled mb-0 small">
                    {formData.role === "HOUSEKEEPING" && (
                      <>
                        <li className="mb-1">• View assigned tasks</li>
                        <li className="mb-1">• Update task status</li>
                        <li className="mb-1">• Upload photos</li>
                        <li className="mb-1">• Create maintenance requests</li>
                      </>
                    )}
                    {formData.role === "RECEPTIONIST" && (
                      <>
                        <li className="mb-1">• Create and assign tasks</li>
                        <li className="mb-1">• View all units</li>
                        <li className="mb-1">• Create inspections</li>
                        <li className="mb-1">• Manage bookings</li>
                      </>
                    )}
                    {formData.role === "SUPERVISOR" && (
                      <>
                        <li className="mb-1">• View all tasks</li>
                        <li className="mb-1">• Escalate issues</li>
                        <li className="mb-1">• Reassign tasks</li>
                        <li className="mb-1">• View reports</li>
                      </>
                    )}
                    {formData.role === "DIRECTOR" && (
                      <>
                        <li className="mb-1">• View all data</li>
                        <li className="mb-1">• Analytics access</li>
                        <li className="mb-1">• Send notifications</li>
                        <li className="mb-1">• Export data</li>
                      </>
                    )}
                    {formData.role === "ADMIN" && (
                      <>
                        <li className="mb-1">• Manage all users</li>
                        <li className="mb-1">• System configuration</li>
                        <li className="mb-1">• Full permissions</li>
                        <li className="mb-1">• Database management</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Activity size={20} className="me-2 text-primary" />
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link
                    href={`/admin/tasks?assignedTo=${userId}`}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                  >
                    <span>View Assigned Tasks</span>
                    <FileText size={16} />
                  </Link>
                  <button className="btn btn-outline-secondary d-flex align-items-center justify-content-between">
                    <span>Reset Password</span>
                    <Key size={16} />
                  </button>
                  <button className="btn btn-outline-warning d-flex align-items-center justify-content-between">
                    <span>View Activity Log</span>
                    <Activity size={16} />
                  </button>
                  <Link
                    href={`/admin/users/edit/${userId}`}
                    className="btn btn-outline-success d-flex align-items-center justify-content-between"
                  >
                    <span>Advanced Edit</span>
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
