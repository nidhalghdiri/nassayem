"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import TaskTypeBadge from "@/components/tasks/TaskTypeBadge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Building,
  Home,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  Download,
  Printer,
  Share2,
  MoreVertical,
  ChevronRight,
  Upload,
} from "lucide-react";

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch task details
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);

      if (response.status === 404) {
        router.push("/admin/tasks");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch task details");
      }

      const data = await response.json();
      console.log("Task Detail Data", data);
      setTask(data.task);
      setPhotos(data.photos || []);
      setNotes(data.task.taskNotes || []);
    } catch (error) {
      console.error("Error fetching task details:", error);
      setErrorMessage("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!task || updating) return;

    const confirmationMessages = {
      IN_PROGRESS: "Start this task?",
      COMPLETED: "Mark this task as completed?",
      CANCELLED: "Cancel this task?",
      ESCALATED: "Escalate this task?",
      PENDING: "Move back to pending?",
    };

    if (
      !confirm(
        confirmationMessages[newStatus] || `Change status to ${newStatus}?`
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        setTask((prev) => ({ ...prev, status: newStatus }));
        setSuccessMessage(
          `Task marked as ${newStatus.toLowerCase().replace("_", " ")}`
        );
        setTimeout(() => setSuccessMessage(""), 3000);

        // If completed, ask for actual time
        if (newStatus === "COMPLETED" && !task.actualMinutes) {
          const actualMinutes = prompt(
            "Enter actual time spent (in minutes):",
            task.estimatedMinutes || "60"
          );
          if (actualMinutes) {
            await updateActualTime(parseInt(actualMinutes));
          }
        }
      } else {
        setErrorMessage(result.error || "Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setErrorMessage("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const updateActualTime = async (actualMinutes) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actualMinutes }),
      });

      if (response.ok) {
        setTask((prev) => ({ ...prev, actualMinutes }));
      }
    } catch (error) {
      console.error("Error updating actual time:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Task deleted successfully");
        setTimeout(() => {
          router.push("/admin/tasks");
        }, 1500);
      } else {
        setErrorMessage(result.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setErrorMessage("Failed to delete task");
    }
  };

  // Add a note
  const handleAddNote = async (e) => {
    e.preventDefault();
    const content = e.target.noteContent.value.trim();

    if (!content) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes((prev) => [newNote, ...prev]);
        e.target.noteContent.value = "";
        setSuccessMessage("Note added successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Check if overdue
  const isOverdue = () => {
    if (
      !task?.dueDate ||
      task.status === "COMPLETED" ||
      task.status === "CANCELLED"
    ) {
      return false;
    }
    return new Date(task.dueDate) < new Date();
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

  if (!task) {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div className="alert alert-danger">
            Task not found. <Link href="/admin/tasks">Return to tasks</Link>
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
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h2 mb-0 text-dark">{task.title}</h1>
                  <TaskStatusBadge status={task.status} />
                  {isOverdue() && (
                    <span className="badge bg-danger">Overdue</span>
                  )}
                </div>
                <p className="text-muted mb-0">Task ID: {task.id}</p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <Printer size={16} />
                  Print
                </button>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                  <Share2 size={16} />
                  Share
                </button>
                <Link
                  href={`/admin/tasks/${taskId}/edit`}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Task
                </Link>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 size={16} className="me-2" />
                        Delete Task
                      </button>
                    </li>
                  </ul>
                </div>
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
          {/* Left Column - Task Details */}
          <div className="col-lg-8">
            {/* Task Info Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Task Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">DESCRIPTION</h6>
                    <p className="mb-0">
                      {task.description || "No description provided"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">TYPE & PRIORITY</h6>
                    <div className="d-flex align-items-center gap-3">
                      <TaskTypeBadge type={task.type} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                  </div>

                  {task.maintenanceType && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted small mb-2">
                        MAINTENANCE TYPE
                      </h6>
                      <p className="mb-0">{task.maintenanceType}</p>
                    </div>
                  )}

                  {task.notes && (
                    <div className="col-12 mb-3">
                      <h6 className="text-muted small mb-2">
                        ADDITIONAL NOTES
                      </h6>
                      <p className="mb-0">{task.notes}</p>
                    </div>
                  )}

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">CREATED</h6>
                    <p className="mb-0">
                      {formatDate(task.createdAt)} by{" "}
                      {task.createdBy?.name || "Unknown"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">LAST UPDATED</h6>
                    <p className="mb-0">{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Assignment Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Location & Assignment</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">BUILDING</h6>
                    <div className="d-flex align-items-center gap-2">
                      <Building size={16} className="text-muted" />
                      <Link
                        href={`/admin/buildings/${task.building?.id}`}
                        className="text-decoration-none"
                      >
                        {task.building?.name}
                      </Link>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">UNIT</h6>
                    <div className="d-flex align-items-center gap-2">
                      <Home size={16} className="text-muted" />
                      <Link
                        href={`/admin/units/${task.unit?.id}`}
                        className="text-decoration-none"
                      >
                        {task.unit?.title} - Floor {task.unit?.floor}
                      </Link>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">CREATED BY</h6>
                    <div className="d-flex align-items-center gap-2">
                      <User size={16} className="text-muted" />
                      <span>{task.createdBy?.name || "Unknown"}</span>
                      <span className="badge bg-secondary small">
                        {task.createdBy?.role}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">ASSIGNED TO</h6>
                    <div className="d-flex align-items-center gap-2">
                      <User size={16} className="text-muted" />
                      {task.assignedTo ? (
                        <>
                          <span>{task.assignedTo.name}</span>
                          <span className="badge bg-secondary small">
                            {task.assignedTo.role}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {task.escalatedTo && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted small mb-2">ESCALATED TO</h6>
                      <div className="d-flex align-items-center gap-2">
                        <AlertCircle size={16} className="text-warning" />
                        <span>{task.escalatedTo.name}</span>
                      </div>
                      {task.escalationReason && (
                        <p className="small text-muted mt-1 mb-0">
                          Reason: {task.escalationReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline & Scheduling Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Timeline & Scheduling</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">DUE DATE</h6>
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={16} className="text-muted" />
                      <span>
                        {task.dueDate
                          ? formatDate(task.dueDate)
                          : "No due date"}
                      </span>
                      {isOverdue() && (
                        <span className="badge bg-danger small">Overdue</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted small mb-2">ESTIMATED TIME</h6>
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={16} className="text-muted" />
                      <span>{formatTime(task.estimatedMinutes)}</span>
                    </div>
                  </div>

                  {task.startedAt && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted small mb-2">STARTED AT</h6>
                      <div className="d-flex align-items-center gap-2">
                        <PlayCircle size={16} className="text-primary" />
                        <span>{formatDate(task.startedAt)}</span>
                      </div>
                    </div>
                  )}

                  {task.completedAt && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted small mb-2">COMPLETED AT</h6>
                      <div className="d-flex align-items-center gap-2">
                        <CheckCircle size={16} className="text-success" />
                        <span>{formatDate(task.completedAt)}</span>
                      </div>
                    </div>
                  )}

                  {task.actualMinutes && (
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted small mb-2">ACTUAL TIME</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={16} className="text-muted" />
                        <span>{formatTime(task.actualMinutes)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-muted small mb-3">CHANGE STATUS</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {task.status !== "IN_PROGRESS" &&
                      task.status !== "COMPLETED" &&
                      task.status !== "CANCELLED" && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleStatusUpdate("IN_PROGRESS")}
                          disabled={updating}
                        >
                          <PlayCircle size={16} className="me-2" />
                          Start Task
                        </button>
                      )}
                    {task.status === "IN_PROGRESS" && (
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handleStatusUpdate("COMPLETED")}
                        disabled={updating}
                      >
                        <CheckCircle size={16} className="me-2" />
                        Mark Complete
                      </button>
                    )}
                    {task.status === "PENDING" && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleStatusUpdate("CANCELLED")}
                        disabled={updating}
                      >
                        <XCircle size={16} className="me-2" />
                        Cancel Task
                      </button>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => {
                          const reason = prompt("Enter escalation reason:");
                          if (reason) {
                            handleStatusUpdate("ESCALATED");
                            // Note: You'd need to handle escalation separately with reason
                          }
                        }}
                        disabled={updating}
                      >
                        <AlertCircle size={16} className="me-2" />
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <MessageSquare size={20} className="me-2 text-primary" />
                  Notes ({notes.length})
                </h5>
              </div>
              <div className="card-body">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="input-group">
                    <textarea
                      name="noteContent"
                      className="form-control"
                      placeholder="Add a note..."
                      rows="2"
                      required
                    ></textarea>
                    <button className="btn btn-primary" type="submit">
                      Add Note
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="notes-list">
                  {notes.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <MessageSquare size={48} className="mb-3" />
                      <p>No notes yet. Add the first note!</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="small fw-semibold">
                              {note.author?.name}
                            </div>
                            <div className="badge bg-secondary small">
                              {note.author?.role}
                            </div>
                          </div>
                          <div className="text-muted small">
                            {formatDate(note.createdAt)}
                          </div>
                        </div>
                        <p className="mb-0">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-lg-4">
            {/* Cost Information Card */}
            {(task.costEstimate || task.actualCost) && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <DollarSign size={20} className="me-2 text-primary" />
                    Cost Information
                  </h5>
                </div>
                <div className="card-body">
                  {task.costEstimate && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">ESTIMATED COST</h6>
                      <h4 className="text-primary">
                        ${parseFloat(task.costEstimate).toFixed(2)}
                      </h4>
                    </div>
                  )}
                  {task.actualCost && (
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">ACTUAL COST</h6>
                      <h4
                        className={
                          task.actualCost > task.costEstimate
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        ${parseFloat(task.actualCost).toFixed(2)}
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photos Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <ImageIcon size={20} className="me-2 text-primary" />
                  Photos ({photos.length})
                </h5>
              </div>
              <div className="card-body">
                {photos.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <ImageIcon size={48} className="mb-3" />
                    <p>No photos uploaded</p>
                  </div>
                ) : (
                  <div className="row g-2">
                    {photos.slice(0, 6).map((photo, index) => (
                      <div key={photo.id} className="col-4">
                        <div className="border rounded overflow-hidden">
                          <img
                            src={photo.url}
                            alt={`Task photo ${index + 1}`}
                            className="img-fluid"
                            style={{
                              height: "100px",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {photos.length > 6 && (
                      <div className="col-12 text-center mt-2">
                        <button className="btn btn-sm btn-outline-secondary">
                          View all {photos.length} photos
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <button className="btn btn-outline-primary w-100">
                    <Upload size={16} className="me-2" />
                    Upload Photos
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link
                    href={`/admin/units/${task.unit?.id}`}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                  >
                    <span>View Unit Details</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link
                    href={`/admin/tasks?unitId=${task.unit?.id}`}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                  >
                    <span>View Unit Tasks</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link
                    href={`/admin/buildings/${task.building?.id}`}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                  >
                    <span>View Building</span>
                    <ChevronRight size={16} />
                  </Link>
                  {task.assignedTo && (
                    <Link
                      href={`/admin/users/${task.assignedTo?.id}`}
                      className="btn btn-outline-info d-flex align-items-center justify-content-between"
                    >
                      <span>View Assigned Staff</span>
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Task Metadata Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Task Metadata</h5>
              </div>
              <div className="card-body">
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Task ID:</span>
                    <code>{task.id}</code>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Created:</span>
                    <span>{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Updated:</span>
                    <span>{new Date(task.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Version:</span>
                    <span>v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this task?</p>
                <div className="alert alert-danger">
                  <strong>Warning:</strong> This action cannot be undone. All
                  task data, including photos and notes, will be permanently
                  deleted.
                </div>
                <p className="mb-0">
                  Task: <strong>{task.title}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutAdmin>
  );
}
