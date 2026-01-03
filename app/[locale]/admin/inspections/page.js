// app/[locale]/admin/inspections/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Eye,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Home,
  User,
} from "lucide-react";

export default function InspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    inspectorId: "all",
    taskId: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInspections, setTotalInspections] = useState(0);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const itemsPerPage = 10;

  // Fetch inspections
  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/inspections?${params}`);
      if (!response.ok) throw new Error("Failed to fetch inspections");

      const data = await response.json();
      setInspections(data.inspections || []);
      setTotalInspections(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  // Fetch filter data
  const fetchFilterData = useCallback(async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/tasks?type=INSPECTION&limit=100"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterData();
    fetchInspections();
  }, [fetchFilterData, fetchInspections]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PASSED: "success",
      FAILED: "danger",
    };
    return `bg-${variants[status] || "secondary"}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-danger";
  };

  const totalPages = Math.ceil(totalInspections / itemsPerPage);

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
                <h1 className="h2 mb-0 text-dark">Inspections</h1>
                <p className="text-muted mb-0">
                  View and manage all unit inspections
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={fetchInspections}
                  disabled={loading}
                >
                  <Filter size={16} />
                  Refresh
                </button>
                <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Inspector</label>
                <select
                  className="form-select"
                  value={filters.inspectorId}
                  onChange={(e) =>
                    handleFilterChange("inspectorId", e.target.value)
                  }
                >
                  <option value="all">All Inspectors</option>
                  {users
                    .filter((user) =>
                      [
                        "RECEPTIONIST",
                        "SUPERVISOR",
                        "ADMIN",
                        "DIRECTOR",
                      ].includes(user.role)
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center p-5">
                <div className="mb-3">
                  <Search size={48} className="text-muted" />
                </div>
                <h5 className="text-muted mb-2">No inspections found</h5>
                <p className="text-muted mb-4">
                  {Object.keys(filters).some(
                    (key) => filters[key] && filters[key] !== "all"
                  )
                    ? "Try adjusting your filters"
                    : "No inspections have been conducted yet"}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Score</th>
                      <th className="border-0">Task</th>
                      <th className="border-0">Unit</th>
                      <th className="border-0">Inspector</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((inspection) => (
                      <tr key={inspection.id}>
                        <td>
                          <div
                            className={`display-6 fw-bold ${getScoreColor(
                              inspection.score
                            )}`}
                          >
                            {inspection.score}%
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="mb-0 fw-semibold">
                              {inspection.task?.title || "N/A"}
                            </p>
                            <small className="text-muted">
                              Task ID: {inspection.taskId}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Home size={14} className="text-muted me-2" />
                            <div>
                              <p className="mb-0 fw-semibold small">
                                {inspection.task?.unit?.title || "N/A"}
                              </p>
                              <p className="mb-0 text-muted small">
                                Floor {inspection.task?.unit?.floor || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <User size={14} className="text-muted me-2" />
                            <div>
                              <p className="mb-0 small">
                                {inspection.inspector?.name}
                              </p>
                              <p className="mb-0 text-muted small">
                                {inspection.inspector?.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="text-muted me-2" />
                            <div>
                              <p className="mb-0 small">
                                {new Date(
                                  inspection.createdAt
                                ).toLocaleDateString()}
                              </p>
                              <p className="mb-0 text-muted small">
                                {new Date(
                                  inspection.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusBadge(
                              inspection.status
                            )}`}
                          >
                            {inspection.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <Link
                              href={`/admin/tasks/${inspection.taskId}`}
                              className="btn btn-sm btn-outline-primary"
                              title="View Task"
                            >
                              <Eye size={16} />
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() =>
                                router.push(
                                  `/admin/inspections/${inspection.id}`
                                )
                              }
                              title="View Inspection Details"
                            >
                              <Search size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {inspections.length > 0 && totalPages > 1 && (
            <div className="card-footer border-top">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <p className="mb-3 mb-md-0 text-muted small">
                  Showing{" "}
                  <span className="fw-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="fw-semibold">
                    {Math.min(currentPage * itemsPerPage, totalInspections)}
                  </span>{" "}
                  of <span className="fw-semibold">{totalInspections}</span>{" "}
                  inspections
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
