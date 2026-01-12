"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Eye,
} from "lucide-react";
import { debounce } from "@/lib/debounce";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  const [loading, setLoading] = useState(true);
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
    actualCost: "",
    actualMinutes: "",
    notes: "",
    escalationReason: "",
  });

  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

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

  // Status options
  const statusOptions = [
    { value: "PENDING", label: "Pending", color: "text-secondary" },
    { value: "IN_PROGRESS", label: "In Progress", color: "text-primary" },
    { value: "COMPLETED", label: "Completed", color: "text-success" },
    { value: "CANCELLED", label: "Cancelled", color: "text-danger" },
    { value: "ESCALATED", label: "Escalated", color: "text-warning" },
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

  // Fetch task data and initial data
  useEffect(() => {
    if (taskId) {
      fetchTaskData();
      fetchInitialData();
    }
  }, [taskId]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);

      if (response.status === 404) {
        router.push("/admin/tasks");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch task data");
      }

      const data = await response.json();
      const task = data.task;

      // Format dates for input fields
      const dueDate = task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "";

      // Prepare form data
      const formData = {
        title: task.title || "",
        description: task.description || "",
        type: task.type || "CLEANING",
        status: task.status || "PENDING",
        priority: task.priority || "MEDIUM",
        buildingId: task.buildingId || "",
        unitId: task.unitId || "",
        assignedToId: task.assignedToId || "",
        dueDate: dueDate,
        estimatedMinutes: task.estimatedMinutes?.toString() || "",
        maintenanceType: task.maintenanceType || "",
        costEstimate: task.costEstimate?.toString() || "",
        actualCost: task.actualCost?.toString() || "",
        actualMinutes: task.actualMinutes?.toString() || "",
        notes: task.notes || "",
        escalationReason: task.escalationReason || "",
      };

      setFormData(formData);
      setOriginalData(formData);
      setSelectedBuilding(task.buildingId || "");

      // Fetch units for the selected building
      if (task.buildingId) {
        fetchUnitsByBuilding(task.buildingId);
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
      setErrorMessage("Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
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
    }
  };

  const fetchUnitsByBuilding = useCallback(
    debounce(async (buildingId) => {
      if (!buildingId) {
        setUnits([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/units?buildingId=${buildingId}&limit=100`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Units fetched:", data.units?.length || 0);
          setUnits(data.units || []);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setUnits([]);
      }
    }, 300), // 300ms debounce
    []
  );

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

    if (formData.actualMinutes) {
      const minutes = parseInt(formData.actualMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 480) {
        newErrors.actualMinutes = "Actual minutes must be between 1 and 480";
      }
    }

    if (formData.costEstimate) {
      const cost = parseFloat(formData.costEstimate);
      if (isNaN(cost) || cost < 0) {
        newErrors.costEstimate = "Cost estimate must be a positive number";
      }
    }

    if (formData.actualCost) {
      const cost = parseFloat(formData.actualCost);
      if (isNaN(cost) || cost < 0) {
        newErrors.actualCost = "Actual cost must be a positive number";
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
      setFormData((prev) => ({ ...prev, unitId: "" })); // Clear unit when building changes

      if (value) {
        fetchUnitsByBuilding(value);
      } else {
        setUnits([]);
      }
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
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        buildingId: formData.buildingId,
        unitId: formData.unitId,
        assignedToId: formData.assignedToId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedMinutes: formData.estimatedMinutes
          ? parseInt(formData.estimatedMinutes)
          : null,
        maintenanceType: formData.maintenanceType || null,
        costEstimate: formData.costEstimate
          ? parseFloat(formData.costEstimate)
          : null,
        actualCost: formData.actualCost
          ? parseFloat(formData.actualCost)
          : null,
        actualMinutes: formData.actualMinutes
          ? parseInt(formData.actualMinutes)
          : null,
        notes: formData.notes?.trim() || null,
        escalationReason: formData.escalationReason?.trim() || null,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Task updated successfully!");
        setOriginalData(formData); // Update original data to reflect changes

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/admin/tasks/${taskId}`);
        }, 2000);
      } else {
        setErrorMessage(result.error || "Failed to update task");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setErrorMessage("An error occurred while updating the task");
    } finally {
      setSaving(false);
    }
  };
  // Test Test 3

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

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleCancel = () => {
    if (
      hasChanges &&
      !confirm("You have unsaved changes. Are you sure you want to cancel?")
    ) {
      return;
    }
    router.push(`/admin/tasks/${taskId}`);
  };

  const resetForm = () => {
    if (confirm("Reset all changes?")) {
      setFormData(originalData);
      setErrors({});
    }
  };

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
                  href={`/admin/tasks/${taskId}`}
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Task Details</span>
                </Link>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h2 mb-0 text-dark">Edit Task</h1>
                  <span className="badge bg-primary">
                    ID: {taskId.slice(0, 8)}...
                  </span>
                  {hasChanges && (
                    <span className="badge bg-warning">Unsaved Changes</span>
                  )}
                </div>
                <p className="text-muted mb-0">
                  Update task information and assignments
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link
                  href={`/admin/tasks/${taskId}`}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                >
                  <Eye size={16} />
                  View
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="taskForm"
                  disabled={saving || !hasChanges}
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

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div
            className="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-4"
            role="alert"
          >
            <AlertCircle className="me-2" size={20} />
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>You have unsaved changes</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={resetForm}
              >
                Reset Changes
              </button>
            </div>
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
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        {statusOptions.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                            className={status.color}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
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
                      <div className="col-md-6 mb-3">
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
                          <option value="">Unassigned</option>
                          {staffUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.status === "ESCALATED" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Escalation Reason</label>
                        <textarea
                          name="escalationReason"
                          value={formData.escalationReason}
                          onChange={handleChange}
                          className="form-control"
                          rows="2"
                          placeholder="Reason for escalation..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scheduling & Time Tracking */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Calendar size={20} className="me-2 text-primary" />
                    Scheduling & Time Tracking
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

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Actual Time (minutes)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Clock size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="actualMinutes"
                          value={formData.actualMinutes}
                          onChange={handleChange}
                          min="1"
                          max="480"
                          className={`form-control ${
                            errors.actualMinutes ? "is-invalid" : ""
                          }`}
                          placeholder="Enter actual time spent"
                        />
                        <span className="input-group-text">minutes</span>
                      </div>
                      {errors.actualMinutes && (
                        <div className="invalid-feedback">
                          {errors.actualMinutes}
                        </div>
                      )}
                      <div className="form-text">
                        Enter actual time spent on task
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Information */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <DollarSign size={20} className="me-2 text-primary" />
                    Cost Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
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

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Actual Cost ($)</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <DollarSign size={16} className="text-muted" />
                        </span>
                        <input
                          type="number"
                          name="actualCost"
                          value={formData.actualCost}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className={`form-control ${
                            errors.actualCost ? "is-invalid" : ""
                          }`}
                          placeholder="Enter actual cost"
                        />
                      </div>
                      {errors.actualCost && (
                        <div className="invalid-feedback">
                          {errors.actualCost}
                        </div>
                      )}
                      <div className="form-text">
                        Enter actual cost if known
                      </div>
                    </div>
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
                </div>
              </div>
            </div>

            {/* Right Column - Quick Guide & Summary */}
            <div className="col-lg-4">
              {/* Changes Summary */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Changes Summary</h5>
                </div>
                <div className="card-body">
                  {hasChanges ? (
                    <div className="alert alert-info small">
                      <strong>Note:</strong> You have unsaved changes. Review
                      and save to apply updates.
                    </div>
                  ) : (
                    <div className="alert alert-success small">
                      <CheckCircle size={16} className="me-2" />
                      All changes saved
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      form="taskForm"
                      disabled={saving || !hasChanges}
                      className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save All Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel Editing
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                      disabled={!hasChanges || saving}
                    >
                      Reset All Changes
                    </button>

                    <Link
                      href={`/admin/tasks/${taskId}`}
                      className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2"
                    >
                      <Eye size={16} />
                      View Task Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Task Summary */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Task Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">CURRENT STATUS</h6>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge ${
                          formData.status === "COMPLETED"
                            ? "bg-success"
                            : formData.status === "IN_PROGRESS"
                            ? "bg-primary"
                            : formData.status === "CANCELLED"
                            ? "bg-danger"
                            : formData.status === "ESCALATED"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {formData.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">TYPE & PRIORITY</h6>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fs-5">
                        {taskTypes.find((t) => t.value === formData.type)
                          ?.icon || "📝"}
                      </span>
                      <span className="fw-semibold">
                        {
                          taskTypes.find((t) => t.value === formData.type)
                            ?.label
                        }
                      </span>
                      <span
                        className={`badge ${
                          formData.priority === "HIGH" ||
                          formData.priority === "URGENT"
                            ? "bg-danger"
                            : formData.priority === "MEDIUM"
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                      >
                        {formData.priority}
                      </span>
                    </div>
                  </div>

                  {formData.buildingId && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">LOCATION</h6>
                      <p className="mb-0 small">
                        <Building size={14} className="text-muted me-2" />
                        {buildings.find((b) => b.id === formData.buildingId)
                          ?.name || "Not Selected"}
                        {formData.unitId && (
                          <>
                            <br />
                            <Home size={14} className="text-muted me-2" />
                            {units.find((u) => u.id === formData.unitId)
                              ?.title || "Not Selected"}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {formData.assignedToId && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">ASSIGNED TO</h6>
                      <p className="mb-0 small">
                        <Users size={14} className="text-muted me-2" />
                        {staffUsers.find((u) => u.id === formData.assignedToId)
                          ?.name || "Not Selected"}
                      </p>
                    </div>
                  )}

                  {formData.dueDate && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">DUE DATE</h6>
                      <p className="mb-0 small">
                        <Calendar size={14} className="text-muted me-2" />
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

              {/* Editing Tips */}
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Editing Tips</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info small mb-3">
                    <strong>Tip:</strong> Update the assigned staff member if
                    task needs reassignment.
                  </div>

                  <div className="alert alert-warning small mb-3">
                    <strong>Note:</strong> Changing status may trigger
                    notifications to assigned staff.
                  </div>

                  <div className="alert alert-success small mb-0">
                    <strong>Best Practice:</strong> Update actual time and cost
                    after task completion for accurate reporting.
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
