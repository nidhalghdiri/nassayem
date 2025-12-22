"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  Home,
  Users,
  FileText,
  Wrench,
  CheckCircle,
  Building,
} from "lucide-react";

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "CLEANING",
    status: "PENDING",
    priority: "MEDIUM",
    buildingId: "",
    unitId: "",
    assignedToId: "",
    dueDate: "",
    estimatedMinutes: "",
    maintenanceType: "",
    costEstimate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Task type options
  const taskTypes = [
    { value: "CLEANING", label: "Cleaning", icon: "🧹" },
    { value: "MAINTENANCE", label: "Maintenance", icon: "🔧" },
    { value: "INSPECTION", label: "Inspection", icon: "📋" },
    { value: "OTHER", label: "Other", icon: "📝" },
  ];

  // Priority options
  const priorityOptions = [
    { value: "LOW", label: "Low", color: "text-success" },
    { value: "MEDIUM", label: "Medium", color: "text-warning" },
    { value: "HIGH", label: "High", color: "text-danger" },
    { value: "URGENT", label: "Urgent", color: "text-danger fw-bold" },
  ];

  // Maintenance types
  const maintenanceTypes = [
    "Plumbing",
    "Electrical",
    "HVAC",
    "Carpentry",
    "Painting",
    "Appliance Repair",
    "Furniture Assembly",
    "Deep Cleaning",
    "Pest Control",
    "Landscaping",
    "Other",
  ];

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch units when building changes
  useEffect(() => {
    if (selectedBuilding) {
      fetchUnitsByBuilding(selectedBuilding);
    } else {
      setUnits([]);
    }
  }, [selectedBuilding]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [buildingsRes, usersRes] = await Promise.all([
        fetch("/api/buildings"),
        fetch("/api/users?role=staff"),
      ]);

      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        setBuildings(buildingsData.buildings || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStaffUsers(usersData.users || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setErrorMessage("Failed to load required data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsByBuilding = async (buildingId) => {
    try {
      const response = await fetch(
        `/api/units?buildingId=${buildingId}&status=AVAILABLE`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Units: ", data.units);
        setUnits(data.units || []);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.type) {
      newErrors.type = "Task type is required";
    }

    if (!formData.buildingId) {
      newErrors.buildingId = "Building selection is required";
    }

    if (!formData.unitId) {
      newErrors.unitId = "Unit selection is required";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate < now) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    if (formData.estimatedMinutes) {
      const minutes = parseInt(formData.estimatedMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 480) {
        newErrors.estimatedMinutes =
          "Estimated minutes must be between 1 and 480";
      }
    }

    if (formData.costEstimate) {
      const cost = parseFloat(formData.costEstimate);
      if (isNaN(cost) || cost < 0) {
        newErrors.costEstimate = "Cost estimate must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle building change separately to fetch units
    if (name === "buildingId") {
      setSelectedBuilding(value);
    }

    // Clear error for this field
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
      // Prepare task data
      const taskData = {
        ...formData,
        estimatedMinutes: formData.estimatedMinutes
          ? parseInt(formData.estimatedMinutes)
          : null,
        costEstimate: formData.costEstimate
          ? parseFloat(formData.costEstimate)
          : null,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Task created successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/tasks");
        }, 2000);
      } else {
        setErrorMessage(result.error || "Failed to create task");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setErrorMessage("An error occurred while creating the task");
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

  // Set default due date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const formattedDate = tomorrow.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dueDate: formattedDate,
    }));
  }, []);

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
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
                  href="/admin/tasks"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Tasks</span>
                </Link>
                <h1 className="h2 mb-0 text-dark">Create New Task</h1>
                <p className="text-muted mb-0">
                  Assign a new cleaning, maintenance, or inspection task
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link href="/admin/tasks" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  form="taskForm"
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
                      Create Task
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

        <form id="taskForm" onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Task Details */}
            <div className="col-lg-8">
              {/* Basic Task Information */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FileText size={20} className="me-2 text-primary" />
                    Task Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Task Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.title ? "is-invalid" : ""
                        }`}
                        placeholder="e.g., Deep clean apartment 301"
                        maxLength="100"
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                      <div className="form-text">
                        Brief, descriptive title for the task
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Provide detailed instructions, specific requirements, or notes..."
                      />
                      <div className="form-text">
                        Optional detailed instructions for the task
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Task Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`form-select ${
                          errors.type ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Select Type</option>
                        {taskTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <div className="invalid-feedback">{errors.type}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority *</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="form-select"
                      >
                        {priorityOptions.map((priority) => (
                          <option
                            key={priority.value}
                            value={priority.value}
                            className={priority.color}
                          >
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.type === "MAINTENANCE" && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Maintenance Type</label>
                        <select
                          name="maintenanceType"
                          value={formData.maintenanceType}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Select Maintenance Type</option>
                          {maintenanceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">
                          Optional: Specify the type of maintenance needed
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Assignment */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Home size={20} className="me-2 text-primary" />
                    Location & Assignment
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Building *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Building size={16} className="text-muted" />
                        </span>
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
                              {building.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.buildingId && (
                        <div className="invalid-feedback">
                          {errors.buildingId}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unit *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Home size={16} className="text-muted" />
                        </span>
                        <select
                          name="unitId"
                          value={formData.unitId}
                          onChange={handleChange}
                          className={`form-select ${
                            errors.unitId ? "is-invalid" : ""
                          }`}
                          disabled={!formData.buildingId}
                        >
                          <option value="">Select Unit</option>
                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.title} - Floor {unit.floor}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.unitId && (
                        <div className="invalid-feedback">{errors.unitId}</div>
                      )}
                      {!formData.buildingId && (
                        <div className="form-text">
                          Please select a building first
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Assign To</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Users size={16} className="text-muted" />
                        </span>
                        <select
                          name="assignedToId"
                          value={formData.assignedToId}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Unassigned (Assign later)</option>
                          {staffUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-text">
                        Leave unassigned to assign later
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling & Cost */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Calendar size={20} className="me-2 text-primary" />
                    Scheduling & Cost
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Due Date</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Calendar size={16} className="text-muted" />
                        </span>
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.dueDate ? "is-invalid" : ""
                          }`}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {errors.dueDate && (
                        <div className="invalid-feedback">{errors.dueDate}</div>
                      )}
                      <div className="form-text">
                        When should this task be completed?
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Estimated Time (minutes)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Clock size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="estimatedMinutes"
                          value={formData.estimatedMinutes}
                          onChange={handleChange}
                          min="1"
                          max="480"
                          className={`form-control ${
                            errors.estimatedMinutes ? "is-invalid" : ""
                          }`}
                          placeholder="e.g., 60"
                        />
                        <span className="input-group-text">minutes</span>
                      </div>
                      {errors.estimatedMinutes && (
                        <div className="invalid-feedback">
                          {errors.estimatedMinutes}
                        </div>
                      )}
                    </div>

                    {(formData.type === "MAINTENANCE" ||
                      formData.type === "INSPECTION") && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cost Estimate ($)</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <DollarSign size={16} className="text-muted" />
                          </span>
                          <input
                            type="number"
                            name="costEstimate"
                            value={formData.costEstimate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={`form-control ${
                              errors.costEstimate ? "is-invalid" : ""
                            }`}
                            placeholder="e.g., 150.00"
                          />
                        </div>
                        {errors.costEstimate && (
                          <div className="invalid-feedback">
                            {errors.costEstimate}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FileText size={20} className="me-2 text-primary" />
                    Additional Notes
                  </h5>
                </div>
                <div className="card-body">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    placeholder="Any special instructions, safety considerations, or additional information..."
                  />
                  <div className="form-text mt-2">
                    These notes will be visible to the assigned staff member
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Guide & Summary */}
            <div className="col-lg-4">
              {/* Task Summary */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Task Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">TYPE</h6>
                    <div className="d-flex align-items-center">
                      <span className="fs-5 me-2">
                        {taskTypes.find((t) => t.value === formData.type)
                          ?.icon || "📝"}
                      </span>
                      <span className="fw-semibold">
                        {taskTypes.find((t) => t.value === formData.type)
                          ?.label || "Not Selected"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">PRIORITY</h6>
                    <span
                      className={`badge ${
                        formData.priority === "HIGH" ||
                        formData.priority === "URGENT"
                          ? "bg-danger"
                          : formData.priority === "MEDIUM"
                          ? "bg-warning"
                          : "bg-success"
                      } fs-6`}
                    >
                      {formData.priority}
                    </span>
                  </div>

                  {formData.buildingId && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">BUILDING</h6>
                      <p className="mb-0">
                        {buildings.find((b) => b.id === formData.buildingId)
                          ?.name || "Not Selected"}
                      </p>
                    </div>
                  )}

                  {formData.unitId && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">UNIT</h6>
                      <p className="mb-0">
                        {units.find((u) => u.id === formData.unitId)?.title ||
                          "Not Selected"}
                      </p>
                    </div>
                  )}

                  {formData.assignedToId && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">ASSIGNED TO</h6>
                      <p className="mb-0">
                        {staffUsers.find((u) => u.id === formData.assignedToId)
                          ?.name || "Not Selected"}
                      </p>
                    </div>
                  )}

                  {formData.dueDate && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">DUE DATE</h6>
                      <p className="mb-0">
                        {new Date(formData.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Guide */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Quick Guide</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info small mb-3">
                    <strong>Tip:</strong> Be specific with task descriptions to
                    ensure clear communication.
                  </div>

                  <div className="alert alert-warning small mb-3">
                    <strong>Priority Guide:</strong>
                    <ul className="mb-0 mt-1 ps-3">
                      <li>
                        <span className="text-success">Low</span>: Can be done
                        anytime
                      </li>
                      <li>
                        <span className="text-warning">Medium</span>: Should be
                        done soon
                      </li>
                      <li>
                        <span className="text-danger">High</span>: Needs
                        attention today
                      </li>
                      <li>
                        <span className="text-danger fw-bold">Urgent</span>:
                        Drop everything and fix
                      </li>
                    </ul>
                  </div>

                  <div className="alert alert-success small mb-0">
                    <strong>Best Practice:</strong> Assign tasks immediately to
                    avoid delays.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-grid gap-3">
                    <button
                      type="submit"
                      form="taskForm"
                      disabled={saving}
                      className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm"></div>
                          Creating Task...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Create Task
                        </>
                      )}
                    </button>

                    <Link
                      href="/admin/tasks"
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Cancel & Return
                    </Link>

                    <button
                      type="button"
                      className="btn btn-outline-info"
                      onClick={() => {
                        // Reset form
                        setFormData({
                          title: "",
                          description: "",
                          type: "CLEANING",
                          status: "PENDING",
                          priority: "MEDIUM",
                          buildingId: "",
                          unitId: "",
                          assignedToId: "",
                          dueDate: new Date(
                            new Date().setDate(new Date().getDate() + 1)
                          )
                            .toISOString()
                            .split("T")[0],
                          estimatedMinutes: "",
                          maintenanceType: "",
                          costEstimate: "",
                          notes: "",
                        });
                        setErrors({});
                        setSelectedBuilding("");
                      }}
                    >
                      Clear Form
                    </button>
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
