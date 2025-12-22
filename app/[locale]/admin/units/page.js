"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  Home,
  CheckCircle,
  Users,
  AlertCircle,
  XCircle,
  DollarSign,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Download,
  ArrowLeft,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Building,
  Bed,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    unavailable: 0,
  });
  const itemsPerPage = 10;

  // Fetch units data from API
  const fetchUnits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: search,
      });

      if (filter !== "all") params.append("status", filter);
      if (buildingFilter !== "all") params.append("buildingId", buildingFilter);

      const response = await fetch(`/api/units?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch units");
      }

      const data = await response.json();
      setUnits(data.units || []);
      setTotalUnits(data.pagination?.total || 0);
      setBuildings(data.buildings || []);

      // Calculate stats from API response
      if (data.stats) {
        const statsData = data.stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count._all;
          return acc;
        }, {});

        setStats({
          total: data.pagination?.total || 0,
          available: statsData.AVAILABLE || 0,
          rented: statsData.RENTED || 0,
          maintenance: statsData.MAINTENANCE || 0,
          unavailable: statsData.UNAVAILABLE || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      alert("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchUnits();
  }, [currentPage, filter, search, buildingFilter]);

  // Handle unit deletion
  const handleDelete = async (unitId, unitTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${unitTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Unit deleted successfully!");
        fetchUnits(); // Refresh the list
      } else {
        alert(`Error: ${result.error || "Failed to delete unit"}`);
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("An error occurred while deleting the unit.");
    }
  };

  // Handle unit status change
  const handleStatusChange = async (unitId, currentStatus, newStatus) => {
    if (
      !confirm(
        `Change unit status to ${newStatus.toLowerCase().replace("_", " ")}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/units/${unitId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Unit status updated successfully!");
        fetchUnits(); // Refresh the list
      } else {
        alert(`Error: ${result.error || "Failed to update unit status"}`);
      }
    } catch (error) {
      console.error("Error updating unit status:", error);
      alert("An error occurred while updating unit status.");
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statuses = {
      AVAILABLE: {
        class: "bg-success",
        text: "Available",
        icon: <CheckCircle size={12} />,
      },
      RENTED: {
        class: "bg-info",
        text: "Rented",
        icon: <Users size={12} />,
      },
      MAINTENANCE: {
        class: "bg-warning",
        text: "Maintenance",
        icon: <Wrench size={12} />,
      },
      UNAVAILABLE: {
        class: "bg-secondary",
        text: "Unavailable",
        icon: <XCircle size={12} />,
      },
    };
    return statuses[status] || statuses.AVAILABLE;
  };

  // Total pages for pagination
  const totalPages = Math.ceil(totalUnits / itemsPerPage);

  if (loading && units.length === 0) {
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
                <h1 className="h2 mb-1 text-dark">Units Management</h1>
                <p className="text-muted mb-0">
                  Manage properties and their availability
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={fetchUnits}
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
                  href="/admin/units/new"
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Add New Unit
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
                    <Home className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Units</h6>
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
                    <h6 className="text-muted mb-1 small">Available</h6>
                    <h4 className="mb-0 fw-bold">{stats.available}</h4>
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
                    <h6 className="text-muted mb-1 small">Rented</h6>
                    <h4 className="mb-0 fw-bold">{stats.rented}</h4>
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
                    <h6 className="text-muted mb-1 small">Maintenance</h6>
                    <h4 className="mb-0 fw-bold">{stats.maintenance}</h4>
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
                    <XCircle className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Unavailable</h6>
                    <h4 className="mb-0 fw-bold">{stats.unavailable}</h4>
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
                    <DollarSign className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Avg. Price</h6>
                    <h4 className="mb-0 fw-bold">
                      {units.length > 0
                        ? formatPrice(
                            units.reduce((sum, unit) => sum + unit.price, 0) /
                              units.length
                          )
                        : "$0"}
                    </h4>
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
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search units by title, location, or floor..."
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

              <div className="col-md-4">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="all">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div className="col-md-4">
                <select
                  value={buildingFilter}
                  onChange={(e) => {
                    setBuildingFilter(e.target.value);
                    setCurrentPage(1);
                  }}
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
            </div>
          </div>
        </div>

        {/* Units Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : units.length === 0 ? (
              <div className="text-center p-5">
                <div className="mb-3">
                  <Home size={48} className="text-muted" />
                </div>
                <h5 className="text-muted mb-2">No units found</h5>
                <p className="text-muted mb-4">
                  {search || filter !== "all" || buildingFilter !== "all"
                    ? "Try adjusting your search or filter"
                    : "Start by adding your first unit"}
                </p>
                <Link href="/admin/units/new" className="btn btn-primary">
                  <PlusCircle size={16} className="me-2" />
                  Add New Unit
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Unit</th>
                      <th className="border-0">Building</th>
                      <th className="border-0">Details</th>
                      <th className="border-0">Price</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Created</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit) => {
                      const statusBadge = getStatusBadge(unit.status);
                      const firstImage =
                        unit.images && unit.images.length > 0
                          ? unit.images[0]
                          : null;

                      return (
                        <tr key={unit.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={unit.title}
                                  className="rounded me-3"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                  }}
                                >
                                  <Home size={20} className="text-muted" />
                                </div>
                              )}
                              <div>
                                <p className="mb-0 fw-semibold">{unit.title}</p>
                                <p className="mb-0 text-muted small">
                                  {unit.location}
                                  {unit.floor && ` • Floor ${unit.floor}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <Building size={14} className="text-muted me-2" />
                              <span className="small">
                                {unit.building?.name || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex gap-3">
                              <div className="d-flex align-items-center gap-1">
                                <Bed size={14} className="text-muted" />
                                <span className="small">{unit.bedrooms}</span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <Bath size={14} className="text-muted" />
                                <span className="small">{unit.bathrooms}</span>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <Maximize2 size={14} className="text-muted" />
                                <span className="small">{unit.area}m²</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <DollarSign
                                size={14}
                                className="text-success me-1"
                              />
                              <span className="fw-semibold">
                                {formatPrice(unit.price)}
                              </span>
                              <span className="text-muted small ms-1">
                                /night
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className={`badge ${statusBadge.class} d-flex align-items-center gap-1`}
                              >
                                {statusBadge.icon}
                                {statusBadge.text}
                              </span>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary p-1"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <span className="visually-hidden">
                                    Change status
                                  </span>
                                  <span className="small">▼</span>
                                </button>
                                <ul className="dropdown-menu">
                                  {unit.status !== "AVAILABLE" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            unit.id,
                                            unit.status,
                                            "AVAILABLE"
                                          )
                                        }
                                      >
                                        Mark as Available
                                      </button>
                                    </li>
                                  )}
                                  {unit.status !== "RENTED" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            unit.id,
                                            unit.status,
                                            "RENTED"
                                          )
                                        }
                                      >
                                        Mark as Rented
                                      </button>
                                    </li>
                                  )}
                                  {unit.status !== "MAINTENANCE" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            unit.id,
                                            unit.status,
                                            "MAINTENANCE"
                                          )
                                        }
                                      >
                                        Mark as Maintenance
                                      </button>
                                    </li>
                                  )}
                                  {unit.status !== "UNAVAILABLE" && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleStatusChange(
                                            unit.id,
                                            unit.status,
                                            "UNAVAILABLE"
                                          )
                                        }
                                      >
                                        Mark as Unavailable
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="small">
                              {unit.createdAt
                                ? new Date(unit.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex justify-content-end gap-2">
                              <Link
                                href={`/admin/units/${unit.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/units/edit/${unit.id}`}
                                className="btn btn-sm btn-outline-success"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() =>
                                  handleDelete(unit.id, unit.title)
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
                                  <li>
                                    <Link
                                      href={`/admin/tasks?unit=${unit.id}`}
                                      className="dropdown-item"
                                    >
                                      View Tasks
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href={`/admin/bookings?unit=${unit.id}`}
                                      className="dropdown-item"
                                    >
                                      View Bookings
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href={`/admin/inspections?unit=${unit.id}`}
                                      className="dropdown-item"
                                    >
                                      View Inspections
                                    </Link>
                                  </li>
                                  <li>
                                    <hr className="dropdown-divider" />
                                  </li>
                                  <li>
                                    <Link
                                      href={`/admin/units/${unit.id}/calendar`}
                                      className="dropdown-item"
                                    >
                                      <Calendar size={14} className="me-2" />
                                      View Calendar
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
          {units.length > 0 && totalPages > 1 && (
            <div className="card-footer border-top">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <p className="mb-3 mb-md-0 text-muted small">
                  Showing{" "}
                  <span className="fw-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="fw-semibold">
                    {Math.min(currentPage * itemsPerPage, totalUnits)}
                  </span>{" "}
                  of <span className="fw-semibold">{totalUnits}</span> units
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
