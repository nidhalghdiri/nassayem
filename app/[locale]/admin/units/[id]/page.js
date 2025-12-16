"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Edit,
  Home,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle,
  Users,
  Wrench,
  XCircle,
  Eye,
  Calendar,
  Building,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id;

  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (unitId) {
      fetchUnitData();
    }
  }, [unitId]);

  const fetchUnitData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/units/${unitId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Unit not found");
          router.push("/admin/units");
          return;
        }
        throw new Error("Failed to fetch unit data");
      }

      const data = await response.json();
      setUnit(data.unit);
      setStatistics(data.statistics);
      setRecentTasks(data.recentTasks || []);
      setUpcomingBookings(data.upcomingBookings || []);
    } catch (error) {
      console.error("Error fetching unit data:", error);
      setError("Failed to load unit data");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      AVAILABLE: {
        class: "bg-success",
        text: "Available",
        icon: <CheckCircle size={16} />,
        color: "success",
      },
      RENTED: {
        class: "bg-info",
        text: "Rented",
        icon: <Users size={16} />,
        color: "info",
      },
      MAINTENANCE: {
        class: "bg-warning",
        text: "Maintenance",
        icon: <Wrench size={16} />,
        color: "warning",
      },
      UNAVAILABLE: {
        class: "bg-secondary",
        text: "Unavailable",
        icon: <XCircle size={16} />,
        color: "secondary",
      },
    };
    return statuses[status] || statuses.AVAILABLE;
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

  if (!unit) {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div className="alert alert-danger">
            Unit not found or failed to load.{" "}
            <Link href="/admin/units">Return to units list</Link>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

  const statusBadge = getStatusBadge(unit.status);
  const images = unit.images || [];
  const amenities = unit.amenities || [];

  return (
    <LayoutAdmin>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div className="mb-3 mb-md-0">
                <Link
                  href="/admin/units"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Units</span>
                </Link>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h2 mb-0 text-dark">{unit.title}</h1>
                  <span
                    className={`badge ${statusBadge.class} d-flex align-items-center gap-1`}
                  >
                    {statusBadge.icon}
                    {statusBadge.text}
                  </span>
                </div>
                <p className="text-muted mb-0">
                  {unit.location}
                  {unit.floor && ` • Floor ${unit.floor}`}
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <Link
                  href={`/admin/units/edit/${unitId}`}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Unit
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Images */}
        {images.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  {/* Main Image */}
                  <div
                    className="position-relative"
                    style={{ height: "400px" }}
                  >
                    <img
                      src={images[activeImageIndex]}
                      alt={unit.title}
                      className="w-100 h-100 object-fit-cover rounded-top"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev > 0 ? prev - 1 : images.length - 1
                            )
                          }
                          style={{ width: "40px", height: "40px" }}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev < images.length - 1 ? prev + 1 : 0
                            )
                          }
                          style={{ width: "40px", height: "40px" }}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="p-3">
                      <div className="d-flex gap-2 overflow-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            className={`border rounded p-1 ${
                              activeImageIndex === index
                                ? "border-primary"
                                : "border-light"
                            }`}
                            onClick={() => setActiveImageIndex(index)}
                            style={{ flex: "0 0 auto" }}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="rounded"
                              style={{
                                width: "80px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {/* Left Column - Unit Details */}
          <div className="col-lg-8">
            {/* Unit Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Home size={20} className="me-2 text-primary" />
                  Unit Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-4">
                    <h6 className="text-muted mb-2">Description</h6>
                    <p className="mb-0">{unit.description}</p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Building
                      </span>
                      <div className="d-flex align-items-center">
                        <Building size={16} className="me-2 text-muted" />
                        <span className="fw-semibold">
                          {unit.building?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Location
                      </span>
                      <div className="d-flex align-items-center">
                        <MapPin size={16} className="me-2 text-muted" />
                        <span className="fw-semibold">{unit.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Price
                      </span>
                      <div className="d-flex align-items-center">
                        <DollarSign size={16} className="me-2 text-success" />
                        <span className="fw-semibold">
                          {formatPrice(unit.price)}
                        </span>
                        <span className="text-muted small ms-1">/night</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Bedrooms
                      </span>
                      <div className="d-flex align-items-center">
                        <Bed size={16} className="me-2 text-muted" />
                        <span className="fw-semibold">{unit.bedrooms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Bathrooms
                      </span>
                      <div className="d-flex align-items-center">
                        <Bath size={16} className="me-2 text-muted" />
                        <span className="fw-semibold">{unit.bathrooms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Area
                      </span>
                      <div className="d-flex align-items-center">
                        <Maximize2 size={16} className="me-2 text-muted" />
                        <span className="fw-semibold">{unit.area} m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Status
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        {statusBadge.icon}
                        <span
                          className={`badge ${statusBadge.class} d-flex align-items-center gap-1`}
                        >
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Created
                      </span>
                      <span className="fw-semibold">
                        {unit.createdAt
                          ? new Date(unit.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">
                        Created By
                      </span>
                      <div className="d-flex align-items-center">
                        <span className="fw-semibold">
                          {unit.user?.name || "N/A"}
                        </span>
                        <span className="text-muted small ms-2">
                          ({unit.user?.email || "N/A"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <CheckCircle size={20} className="me-2 text-primary" />
                    Amenities ({amenities.length})
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="col-md-4 mb-2">
                        <div className="d-flex align-items-center">
                          <CheckCircle
                            size={16}
                            className="me-2 text-success"
                          />
                          <span>{amenity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            {recentTasks.length > 0 && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Clock size={20} className="me-2 text-primary" />
                    Recent Tasks
                  </h5>
                  <Link
                    href={`/admintasks?unitId=${unitId}`}
                    className="btn btn-sm btn-link"
                  >
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {recentTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/admintasks/${task.id}`}
                        className="list-group-item list-group-item-action border-0 px-0 py-2"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{task.title}</h6>
                            <small className="text-muted">
                              {task.type} • {task.status}
                            </small>
                          </div>
                          <Clock size={16} className="text-muted" />
                        </div>
                        {task.dueDate && (
                          <small className="text-muted">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </small>
                        )}
                        {task.assignedTo && (
                          <div className="mt-1">
                            <small className="text-muted">
                              Assigned to: {task.assignedTo.name}
                            </small>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="col-lg-4">
            {/* Quick Stats */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Stats</h5>
              </div>
              <div className="card-body">
                {statistics ? (
                  <div className="row">
                    <div className="col-6 mb-3">
                      <div className="text-center">
                        <div
                          className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <Calendar className="text-success" size={24} />
                        </div>
                        <h4 className="mb-1">
                          {statistics.bookings?.active || 0}
                        </h4>
                        <p className="text-muted mb-0 small">Active Bookings</p>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="text-center">
                        <div
                          className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <CheckCircle className="text-success" size={24} />
                        </div>
                        <h4 className="mb-1">
                          {statistics.tasks?.completed || 0}
                        </h4>
                        <p className="text-muted mb-0 small">Completed Tasks</p>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="text-center">
                        <div
                          className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <Wrench className="text-success" size={24} />
                        </div>
                        <h4 className="mb-1">
                          {statistics.tasks?.pending || 0}
                        </h4>
                        <p className="text-muted mb-0 small">Pending Tasks</p>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="text-center">
                        <div
                          className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <Star className="text-success" size={24} />
                        </div>
                        <h4 className="mb-1">
                          {statistics.inspections?.total || 0}
                        </h4>
                        <p className="text-muted mb-0 small">Inspections</p>
                      </div>
                    </div>
                    {statistics.tasks && (
                      <div className="col-12 mt-2">
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${statistics.tasks.completionRate || 0}%`,
                            }}
                            aria-valuenow={statistics.tasks.completionRate || 0}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <span className="visually-hidden">
                              {statistics.tasks.completionRate || 0}% completion
                              rate
                            </span>
                          </div>
                        </div>
                        <p className="text-center small text-muted mt-1 mb-0">
                          Task Completion:{" "}
                          {statistics.tasks.completionRate || 0}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading stats...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link
                    href={`/adminbookings/new?unitId=${unitId}`}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                  >
                    <span>Create Booking</span>
                    <Calendar size={16} />
                  </Link>
                  <Link
                    href={`/admintasks/new?unitId=${unitId}&type=MAINTENANCE`}
                    className="btn btn-outline-warning d-flex align-items-center justify-content-between"
                  >
                    <span>Create Maintenance Task</span>
                    <Wrench size={16} />
                  </Link>
                  <Link
                    href={`/admintasks/new?unitId=${unitId}&type=CLEANING`}
                    className="btn btn-outline-success d-flex align-items-center justify-content-between"
                  >
                    <span>Create Cleaning Task</span>
                    <CheckCircle size={16} />
                  </Link>
                  <Link
                    href={`/admininspections/new?unitId=${unitId}`}
                    className="btn btn-outline-info d-flex align-items-center justify-content-between"
                  >
                    <span>Create Inspection</span>
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/units/edit/${unitId}`}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                  >
                    <span>Edit Unit</span>
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Upcoming Bookings</h5>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="list-group-item border-0 px-0 py-2"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              {booking.user?.name || "Guest"}
                            </h6>
                            <small className="text-muted">
                              {booking.guests} guest
                              {booking.guests !== 1 ? "s" : ""}
                            </small>
                          </div>
                          <span className="badge bg-success">Confirmed</span>
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">
                            Check-in:{" "}
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </small>
                          <br />
                          <small className="text-muted">
                            Check-out:{" "}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="mt-2">
                          <small className="fw-semibold">
                            Total: {formatPrice(booking.totalPrice)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Building Info */}
            {unit.building && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Building size={20} className="me-2 text-primary" />
                    Building Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6 className="fw-semibold mb-1">{unit.building.name}</h6>
                    <p className="text-muted small mb-2">
                      {unit.building.address}
                    </p>
                  </div>
                  <Link
                    href={`/adminbuildings/${unit.building.id}`}
                    className="btn btn-sm btn-outline-primary w-100"
                  >
                    View Building Details
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
