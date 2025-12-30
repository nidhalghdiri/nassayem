// app/[locale]/admin/tasks/assign/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Users,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Building,
  Home,
  RefreshCw,
  Eye,
  Edit,
} from "lucide-react";

export default function TaskAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: "PENDING",
    type: "all",
    priority: "all",
    buildingId: "all",
    assignedToId: "all",
  });
  const [buildings, setBuildings] = useState([]);
  const [bulkAssign, setBulkAssign] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes, buildingsRes] = await Promise.all([
        fetch(
          `/api/tasks?status=${filters.status}&type=${filters.type}&priority=${filters.priority}&buildingId=${filters.buildingId}&assignedToId=${filters.assignedToId}`
        ),
        fetch("/api/users?role=staff&available=true"),
        fetch("/api/buildings"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStaffUsers(usersData.users || []);
      }

      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        setBuildings(buildingsData.buildings || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId, userId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (response.ok) {
        // Refresh tasks
        fetchData();
      }
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  const handleBulkAssign = async (userId) => {
    if (!userId || bulkAssign.length === 0) return;

    setAssigning(true);
    try {
      const promises = bulkAssign.map((taskId) =>
        fetch(`/api/tasks/${taskId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignedToId: userId }),
        })
      );

      await Promise.all(promises);
      setBulkAssign([]);
      fetchData();
    } catch (error) {
      console.error("Error bulk assigning:", error);
    } finally {
      setAssigning(false);
    }
  };

  const toggleBulkSelect = (taskId) => {
    setBulkAssign((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-success" />;
      case "IN_PROGRESS":
        return <Clock size={16} className="text-warning" />;
      case "PENDING":
        return <Clock size={16} className="text-secondary" />;
      case "CANCELLED":
        return <XCircle size={16} className="text-danger" />;
      default:
        return <AlertCircle size={16} />;
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
                  href="/admin/tasks"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Tasks</span>
                </Link>
                <h1 className="h2 mb-0 text-dark">Task Assignment</h1>
                <p className="text-muted mb-0">
                  Assign tasks to staff members and manage workload
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={fetchData}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <Link href="/admin/tasks/new" className="btn btn-primary">
                  Create New Task
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Assignment Bar */}
        {bulkAssign.length > 0 && (
          <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
            <div>
              <strong>{bulkAssign.length} tasks selected</strong>
              <span className="ms-2 text-muted">
                Assign all selected tasks to:
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm w-auto"
                onChange={(e) => handleBulkAssign(e.target.value)}
                disabled={assigning}
              >
                <option value="">Select staff member</option>
                {staffUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setBulkAssign([])}
                className="btn btn-sm btn-outline-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="all">All Status</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="all">All Types</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="all">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Building</label>
                <select
                  className="form-select"
                  value={filters.buildingId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      buildingId: e.target.value,
                    }))
                  }
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
                <label className="form-label">Assigned To</label>
                <select
                  className="form-select"
                  value={filters.assignedToId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      assignedToId: e.target.value,
                    }))
                  }
                >
                  <option value="all">All Staff</option>
                  <option value="unassigned">Unassigned</option>
                  {staffUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                          tasks.length > 0 && bulkAssign.length === tasks.length
                        }
                        onChange={() => {
                          if (bulkAssign.length === tasks.length) {
                            setBulkAssign([]);
                          } else {
                            setBulkAssign(tasks.map((t) => t.id));
                          }
                        }}
                      />
                    </th>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={bulkAssign.includes(task.id)}
                          onChange={() => toggleBulkSelect(task.id)}
                        />
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <strong>{task.title}</strong>
                          <small
                            className="text-muted truncate"
                            style={{ maxWidth: "250px" }}
                          >
                            {task.description}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {task.type}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <small>
                            <Building size={12} className="me-1" />
                            {task.building?.name}
                          </small>
                          <small>
                            <Home size={12} className="me-1" />
                            {task.unit?.title} (Floor {task.unit?.floor})
                          </small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        {task.dueDate ? (
                          <div className="d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted">No due date</span>
                        )}
                      </td>
                      <td>
                        {task.assignedTo ? (
                          <div className="d-flex align-items-center gap-2">
                            <Users size={14} />
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <select
                            className="form-select form-select-sm"
                            value=""
                            onChange={(e) =>
                              handleAssignTask(task.id, e.target.value)
                            }
                          >
                            <option value="">Assign to...</option>
                            {staffUsers
                              .filter(
                                (user) =>
                                  user.role === "HOUSEKEEPING" ||
                                  user.role === "MAINTENANCE"
                              )
                              .map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.role})
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span>{task.status}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            href={`/admin/tasks/${task.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={`/admin/tasks/${task.id}/edit`}
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="text-muted">
                          No tasks found matching your filters
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
