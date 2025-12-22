"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import TaskTypeBadge from "@/components/tasks/TaskTypeBadge";
import {
  PlusCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  AlertCircle,
  Home,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    overdue: 0,
    byStatus: {},
    byType: {},
  });
  const itemsPerPage = 10;

  // Use refs to prevent re-renders
  const filtersRef = useRef({});
  const isMounted = useRef(false);
  const fetchInProgress = useRef(false);

  // Use useMemo to stabilize the filters object
  const stableFilters = useMemo(
    () => filters,
    [
      // Stringify the filters to compare content, not reference
      JSON.stringify(Object.keys(filters).sort()),
      ...Object.keys(filters).map((key) => filters[key]),
    ]
  );

  // Fetch tasks with ref to avoid dependency issues
  const fetchTasks = useCallback(async () => {
    if (fetchInProgress.current) return;

    fetchInProgress.current = true;
    console.log(
      "fetchTasks called with filters:",
      filtersRef.current,
      "page:",
      currentPage
    );

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Use filtersRef instead of filters
      Object.keys(filtersRef.current).forEach((key) => {
        const value = filtersRef.current[key];
        if (value && value !== "all" && value !== false) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      setTasks(data.tasks || []);
      setTotalTasks(data.pagination?.total || 0);
      setStatistics(
        data.statistics || {
          total: 0,
          overdue: 0,
          byStatus: {},
          byType: {},
        }
      );
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage]); // Only depends on currentPage

  // Fetch filter data - only once
  const fetchFilterData = useCallback(async () => {
    try {
      const [usersRes, buildingsRes, unitsRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/buildings"),
        fetch("/api/units?limit=100"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        setBuildings(buildingsData.buildings || []);
      }
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.units || []);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  }, []);

  // Initial load - only once on mount
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      console.log("Initial mount - fetching data");
      fetchFilterData();

      // Initial tasks fetch with small delay to ensure filter data is loaded
      setTimeout(() => {
        fetchTasks();
      }, 100);
    }
  }, []); // Empty array - runs once

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;

    // Only fetch if component is mounted and not initial load
    if (isMounted.current) {
      const timer = setTimeout(() => {
        fetchTasks();
      }, 300); // Debounce filter changes

      return () => clearTimeout(timer);
    }
  }, [stableFilters]); // Use stableFilters as dependency

  // Handle page changes
  useEffect(() => {
    if (isMounted.current) {
      fetchTasks();
    }
  }, [currentPage]);

  const handleFilterChange = (newFilters) => {
    console.log("Filter change:", newFilters);

    // Clean the filters before setting
    const cleanedFilters = { ...newFilters };
    Object.keys(cleanedFilters).forEach((key) => {
      if (
        cleanedFilters[key] === "all" ||
        cleanedFilters[key] === false ||
        cleanedFilters[key] === ""
      ) {
        delete cleanedFilters[key];
      }
    });

    setFilters(cleanedFilters);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  const handleDelete = async (taskId, taskTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Task deleted successfully!");
        fetchTasks(); // Refresh the list
      } else {
        alert(`Error: ${result.error || "Failed to delete task"}`);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("An error occurred while deleting the task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus, taskTitle) => {
    if (
      !confirm(
        `Change task status to ${newStatus.toLowerCase().replace("_", " ")}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Task status updated successfully!");
        fetchTasks(); // Refresh the list
      } else {
        alert(`Error: ${result.error || "Failed to update task status"}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("An error occurred while updating task status.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "COMPLETED" || status === "CANCELLED")
      return false;
    return new Date(dueDate) < new Date();
  };

  const totalPages = Math.ceil(totalTasks / itemsPerPage);

  if (loading && tasks.length === 0) {
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
                <h1 className="h2 mb-1 text-dark">Task Management</h1>
                <p className="text-muted mb-0">
                  Manage cleaning, maintenance, and inspection tasks
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={fetchTasks}
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={
                      loading ? "spinner-border spinner-border-sm" : ""
                    }
                  />
                  Refresh
                </button>
                <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
                <Link
                  href="/admin/tasks/new"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Create Task
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Filter className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Tasks</h6>
                    <h4 className="mb-0 fw-bold">{statistics.total}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <AlertCircle className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Overdue</h6>
                    <h4 className="mb-0 fw-bold">{statistics.overdue}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Clock className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">In Progress</h6>
                    <h4 className="mb-0 fw-bold">
                      {statistics.byStatus?.IN_PROGRESS || 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Home className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Cleaning</h6>
                    <h4 className="mb-0 fw-bold">
                      {statistics.byType?.CLEANING || 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Calendar className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Maintenance</h6>
                    <h4 className="mb-0 fw-bold">
                      {statistics.byType?.MAINTENANCE || 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-4 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Users className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Pending</h6>
                    <h4 className="mb-0 fw-bold">
                      {statistics.byStatus?.PENDING || 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          users={users}
          buildings={buildings}
          units={units}
          loading={loading}
          key="task-filters" // Add key to prevent unnecessary re-renders
        />

        {/* Tasks Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center p-5">
                <div className="mb-3">
                  <Filter size={48} className="text-muted" />
                </div>
                <h5 className="text-muted mb-2">No tasks found</h5>
                <p className="text-muted mb-4">
                  {Object.keys(filters).length > 0
                    ? "Try adjusting your filters"
                    : "Start by creating your first task"}
                </p>
                <Link href="/admin/tasks/new" className="btn btn-primary">
                  <PlusCircle size={16} className="me-2" />
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Task</th>
                      <th className="border-0">Unit</th>
                      <th className="border-0">Assigned To</th>
                      <th className="border-0">Due Date</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Priority</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);

                      return (
                        <tr
                          key={task.id}
                          className={overdue ? "table-warning" : ""}
                        >
                          <td>
                            <div>
                              <p className="mb-0 fw-semibold">{task.title}</p>
                              <div className="d-flex align-items-center gap-2">
                                <TaskTypeBadge
                                  type={task.type}
                                  size="sm"
                                  showText={false}
                                />
                                <span className="text-muted small">
                                  {task.type}
                                </span>
                              </div>
                              {task.description && (
                                <p
                                  className="mb-0 text-muted small mt-1 text-truncate"
                                  style={{ maxWidth: "200px" }}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <Home size={14} className="text-muted me-2" />
                              <div>
                                <p className="mb-0 fw-semibold small">
                                  {task.unit?.title}
                                </p>
                                <p className="mb-0 text-muted small">
                                  Floor {task.unit?.floor}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            {task.assignedTo ? (
                              <div className="d-flex align-items-center">
                                <Users size={14} className="text-muted me-2" />
                                <div>
                                  <p className="mb-0 small">
                                    {task.assignedTo.name}
                                  </p>
                                  <p className="mb-0 text-muted small">
                                    {task.assignedTo.role}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted small">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <Calendar size={14} className="text-muted me-2" />
                              <div>
                                <p className="mb-0 small">
                                  {task.dueDate
                                    ? formatDate(task.dueDate)
                                    : "No due date"}
                                </p>
                                {overdue && (
                                  <span className="badge bg-danger small">
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <TaskStatusBadge status={task.status} size="sm" />
                          </td>

                          <td>
                            <TaskPriorityBadge
                              priority={task.priority}
                              size="sm"
                            />
                          </td>

                          <td>
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                href={`/admin/tasks/${task.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/tasks/${task.id}/edit`}
                                className="btn btn-sm btn-outline-success"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() =>
                                  handleDelete(task.id, task.title)
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  title="More options"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  {task.status !== "IN_PROGRESS" &&
                                    task.status !== "COMPLETED" && (
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() =>
                                            handleStatusChange(
                                              task.id,
                                              "IN_PROGRESS",
                                              task.title
                                            )
                                          }
                                        >
                                          Start Task
                                        </button>
                                      </li>
                                    )}
                                  {task.status === "IN_PROGRESS" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            task.id,
                                            "COMPLETED",
                                            task.title
                                          )
                                        }
                                      >
                                        Mark Complete
                                      </button>
                                    </li>
                                  )}
                                  {task.status === "PENDING" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            task.id,
                                            "CANCELLED",
                                            task.title
                                          )
                                        }
                                      >
                                        Cancel Task
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <hr className="dropdown-divider" />
                                  </li>
                                  <li>
                                    <Link
                                      href={`/admin/units/${task.unit?.id}`}
                                      className="dropdown-item"
                                    >
                                      View Unit
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href={`/admin/tasks?unitId=${task.unit?.id}`}
                                      className="dropdown-item"
                                    >
                                      Unit Tasks
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {tasks.length > 0 && totalPages > 1 && (
            <div className="card-footer border-top">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <p className="mb-3 mb-md-0 text-muted small">
                  Showing{" "}
                  <span className="fw-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="fw-semibold">
                    {Math.min(currentPage * itemsPerPage, totalTasks)}
                  </span>{" "}
                  of <span className="fw-semibold">{totalTasks}</span> tasks
                </p>

                <nav aria-label="Page navigation">
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <li
                            key={i}
                            className={`page-item ${
                              currentPage === pageNum ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <li key={i} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages || loading}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutAdmin>
  );
}
