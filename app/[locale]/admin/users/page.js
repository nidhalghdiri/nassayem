"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building,
  Clock,
} from "lucide-react";
import LayoutAdmin from "../../../../components/layout/LayoutAdmin";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    housekeeping: 0,
    receptionist: 0,
    supervisor: 0,
    director: 0,
    admin: 0,
  });
  const itemsPerPage = 10;

  // Fetch users data from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users?page=${currentPage}&limit=${itemsPerPage}&role=${
          filter !== "all" && filter !== "active" && filter !== "inactive"
            ? filter
            : ""
        }&status=${
          filter === "active" || filter === "inactive" ? filter : ""
        }&search=${search}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);

      // Calculate stats from all users (you might want a separate API endpoint for stats)
      calculateStats(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      // You can show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from users data
  const calculateStats = (usersData) => {
    const stats = {
      total: usersData.length,
      active: usersData.filter((u) => u.isActive).length,
      housekeeping: usersData.filter((u) => u.role === "HOUSEKEEPING").length,
      receptionist: usersData.filter((u) => u.role === "RECEPTIONIST").length,
      supervisor: usersData.filter((u) => u.role === "SUPERVISOR").length,
      director: usersData.filter((u) => u.role === "DIRECTOR").length,
      admin: usersData.filter((u) => u.role === "ADMIN").length,
    };
    setStats(stats);
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter, search]);

  // Handle user deletion
  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("User deleted successfully!");
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        alert(`User ${newStatus ? "activated" : "deactivated"} successfully!`);
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("An error occurred while updating user status.");
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Role colors
  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "badge bg-purple",
      DIRECTOR: "badge bg-danger",
      SUPERVISOR: "badge bg-warning",
      RECEPTIONIST: "badge bg-info",
      HOUSEKEEPING: "badge bg-success",
    };
    return colors[role] || "badge bg-secondary";
  };

  // Status display
  const getStatusDisplay = (isActive) => {
    return isActive
      ? {
          class: "badge bg-success",
          icon: <CheckCircle size={14} />,
          text: "Active",
        }
      : {
          class: "badge bg-danger",
          icon: <XCircle size={14} />,
          text: "Inactive",
        };
  };

  // Total pages for pagination
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (loading && users.length === 0) {
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
                <h1 className="h2 mb-1 text-dark">Users Management</h1>
                <p className="text-muted mb-0">
                  Manage team members and their permissions
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={fetchUsers}
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
                  href="/admin/users/new"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <UserPlus size={16} />
                  Add New User
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
                    <Users className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Users</h6>
                    <h4 className="mb-0 fw-bold">{stats.total}</h4>
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
                    <CheckCircle className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Active</h6>
                    <h4 className="mb-0 fw-bold">{stats.active}</h4>
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
                    <Shield className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Housekeeping</h6>
                    <h4 className="mb-0 fw-bold">{stats.housekeeping}</h4>
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
                    <h6 className="text-muted mb-1 small">Receptionists</h6>
                    <h4 className="mb-0 fw-bold">{stats.receptionist}</h4>
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
                    <Shield className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Supervisors</h6>
                    <h4 className="mb-0 fw-bold">{stats.supervisor}</h4>
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
                    <Shield className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Admins</h6>
                    <h4 className="mb-0 fw-bold">{stats.admin}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search users by name, email, or phone..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    disabled={loading}
                  />
                  {loading && (
                    <span className="input-group-text bg-transparent">
                      <div className="spinner-border spinner-border-sm text-primary"></div>
                    </span>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="ADMIN">Admin</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                  </select>

                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <Filter size={16} />
                    More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-5">
                <div className="mb-3">
                  <Users size={48} className="text-muted" />
                </div>
                <h5 className="text-muted mb-2">No users found</h5>
                <p className="text-muted mb-4">
                  {search
                    ? "Try adjusting your search or filter"
                    : "Start by adding your first user"}
                </p>
                <Link href="/admin/users/new" className="btn btn-primary">
                  <UserPlus size={16} className="me-2" />
                  Add New User
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">User</th>
                      <th className="border-0">Role</th>
                      <th className="border-0">Contact</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Last Login</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const statusDisplay = getStatusDisplay(user.isActive);

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                style={{ width: "40px", height: "40px" }}
                              >
                                {user.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="mb-0 fw-semibold">{user.name}</p>
                                <p className="mb-0 text-muted small">
                                  {user.email}
                                </p>
                                {user.building && (
                                  <div className="d-flex align-items-center gap-1 mt-1">
                                    <Building
                                      size={12}
                                      className="text-muted"
                                    />
                                    <span className="text-muted small">
                                      {user.building.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={getRoleColor(user.role)}>
                              {user.role?.replace(/_/g, " ") || "N/A"}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center gap-2">
                                <Mail size={14} className="text-muted" />
                                <span className="small">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="d-flex align-items-center gap-2">
                                  <Phone size={14} className="text-muted" />
                                  <span className="small">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {statusDisplay.icon}
                              <button
                                className={`btn btn-sm ${
                                  user.isActive
                                    ? "btn-outline-danger"
                                    : "btn-outline-success"
                                }`}
                                onClick={() =>
                                  handleToggleStatus(user.id, user.isActive)
                                }
                                title={
                                  user.isActive
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                              >
                                {user.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex flex-column">
                              <span className="small">
                                {formatDate(user.lastLogin)}
                              </span>
                              <span className="text-muted extra-small">
                                <Clock size={12} className="me-1" />
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                    )
                                  : "Never logged in"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/users/edit/${user.id}`}
                                className="btn btn-sm btn-outline-success"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDelete(user.id, user.name)}
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  title="More options"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <button className="dropdown-item">
                                      Send Message
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item">
                                      Reset Password
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item">
                                      View Activity
                                    </button>
                                  </li>
                                  <li>
                                    <hr className="dropdown-divider" />
                                  </li>
                                  <li>
                                    <button
                                      className={`dropdown-item ${
                                        user.isActive
                                          ? "text-danger"
                                          : "text-success"
                                      }`}
                                      onClick={() =>
                                        handleToggleStatus(
                                          user.id,
                                          user.isActive
                                        )
                                      }
                                    >
                                      {user.isActive
                                        ? "Deactivate Account"
                                        : "Activate Account"}
                                    </button>
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
          {users.length > 0 && totalPages > 1 && (
            <div className="card-footer border-top">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <p className="mb-3 mb-md-0 text-muted small">
                  Showing{" "}
                  <span className="fw-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="fw-semibold">
                    {Math.min(currentPage * itemsPerPage, totalUsers)}
                  </span>{" "}
                  of <span className="fw-semibold">{totalUsers}</span> users
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
                      // Show only first, last, and pages around current page
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
