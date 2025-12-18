"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, X } from "lucide-react";

const TaskFilters = ({
  onFilterChange,
  initialFilters = {},
  users = [],
  buildings = [],
  units = [],
  loading = false,
}) => {
  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    status: initialFilters.status || "all",
    type: initialFilters.type || "all",
    priority: initialFilters.priority || "all",
    assignedToId: initialFilters.assignedToId || "all",
    createdById: initialFilters.createdById || "all",
    unitId: initialFilters.unitId || "all",
    buildingId: initialFilters.buildingId || "all",
    overdue: initialFilters.overdue || false,
    startDate: initialFilters.startDate || "",
    endDate: initialFilters.endDate || "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "ESCALATED", label: "Escalated" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "INSPECTION", label: "Inspection" },
    { value: "OTHER", label: "Other" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFilters((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      status: "all",
      type: "all",
      priority: "all",
      assignedToId: "all",
      createdById: "all",
      unitId: "all",
      buildingId: "all",
      overdue: false,
      startDate: "",
      endDate: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const hasActiveFilters = () => {
    const {
      search,
      status,
      type,
      priority,
      assignedToId,
      createdById,
      unitId,
      buildingId,
      overdue,
      startDate,
      endDate,
    } = filters;
    return (
      search !== "" ||
      status !== "all" ||
      type !== "all" ||
      priority !== "all" ||
      assignedToId !== "all" ||
      createdById !== "all" ||
      unitId !== "all" ||
      buildingId !== "all" ||
      overdue ||
      startDate !== "" ||
      endDate !== ""
    );
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== "";
    if (key === "overdue") return value;
    if (key === "startDate" || key === "endDate") return value !== "";
    return value !== "all";
  }).length;

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Basic Filters */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleChange}
                  className="form-control border-start-0"
                  placeholder="Search tasks..."
                  disabled={loading}
                />
                {loading && (
                  <span className="input-group-text bg-transparent">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </span>
                )}
              </div>
            </div>

            <div className="col-md-2">
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                name="priority"
                value={filters.priority}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={loading}
              >
                <Filter size={16} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-top pt-3">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small">Assigned To</label>
                  <select
                    name="assignedToId"
                    value={filters.assignedToId}
                    onChange={handleChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="all">All Users</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small">Created By</label>
                  <select
                    name="createdById"
                    value={filters.createdById}
                    onChange={handleChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="all">All Creators</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small">Building</label>
                  <select
                    name="buildingId"
                    value={filters.buildingId}
                    onChange={handleChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="all">All Buildings</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small">Unit</label>
                  <select
                    name="unitId"
                    value={filters.unitId}
                    onChange={handleChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="all">All Units</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.title} (Floor {unit.floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small">Date Range</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleChange}
                        className="form-control"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleChange}
                        className="form-control"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="overdueFilter"
                      name="overdue"
                      checked={filters.overdue}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="overdueFilter"
                    >
                      Overdue Only
                    </label>
                  </div>
                </div>

                <div className="col-md-6 d-flex align-items-end justify-content-end gap-2">
                  {hasActiveFilters() && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      <X size={16} className="me-1" />
                      Clear All
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mt-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <small className="text-muted me-2">Active filters:</small>
              {filters.search && (
                <span className="badge bg-info d-flex align-items-center gap-1">
                  Search: {filters.search}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, search: "" }))
                    }
                  ></button>
                </span>
              )}
              {filters.status !== "all" && (
                <span className="badge bg-secondary d-flex align-items-center gap-1">
                  Status:{" "}
                  {statusOptions.find((s) => s.value === filters.status)?.label}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: "all" }))
                    }
                  ></button>
                </span>
              )}
              {filters.type !== "all" && (
                <span className="badge bg-success d-flex align-items-center gap-1">
                  Type:{" "}
                  {typeOptions.find((t) => t.value === filters.type)?.label}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, type: "all" }))
                    }
                  ></button>
                </span>
              )}
              {filters.priority !== "all" && (
                <span className="badge bg-warning d-flex align-items-center gap-1">
                  Priority:{" "}
                  {
                    priorityOptions.find((p) => p.value === filters.priority)
                      ?.label
                  }
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, priority: "all" }))
                    }
                  ></button>
                </span>
              )}
              {filters.overdue && (
                <span className="badge bg-danger d-flex align-items-center gap-1">
                  Overdue Only
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, overdue: false }))
                    }
                  ></button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
