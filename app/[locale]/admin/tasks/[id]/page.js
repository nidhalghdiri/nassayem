// app/[locale]/admin/tasks/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Building,
  Home,
  Calendar,
  DollarSign,
  FileText,
  Wrench,
  PlusCircle,
  History,
  MessageSquare,
  Camera,
  ChevronRight,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data.task);

        // Fetch related tasks
        if (data.task.unitId) {
          fetchRelatedTasks(data.task.unitId);
        }
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTasks = async (unitId) => {
    try {
      const [inspectionsRes, maintenanceRes] = await Promise.all([
        fetch(`/api/tasks?unitId=${unitId}&type=INSPECTION&limit=5`),
        fetch(`/api/tasks?unitId=${unitId}&type=MAINTENANCE&limit=5`),
      ]);

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        setInspections(inspectionsData.tasks || []);
      }

      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        setMaintenanceTasks(maintenanceData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching related tasks:", error);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTaskDetails();

        // If completing a cleaning task, suggest creating an inspection
        if (newStatus === "COMPLETED" && task.type === "CLEANING") {
          setTimeout(() => {
            if (window.confirm("Create inspection for this unit?")) {
              router.push(
                `/admin/tasks/new?unitId=${task.unitId}&type=INSPECTION&buildingId=${task.buildingId}`
              );
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const addTaskNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const response = await fetch(`/api/tasks/${taskId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newNote,
          type: "INTERNAL",
        }),
      });

      if (response.ok) {
        setNewNote("");
        fetchTaskDetails();
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const createFollowupTask = (type) => {
    router.push(
      `/admin/tasks/new?unitId=${task.unitId}&type=${type}&buildingId=${task.buildingId}&parentTaskId=${taskId}`
    );
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
          <div className="alert alert-danger">Task not found</div>
          <Link href="/admin/tasks" className="btn btn-primary">
            Back to Tasks
          </Link>
        </div>
      </LayoutAdmin>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "warning",
      ASSIGNED: "info",
      IN_PROGRESS: "primary",
      COMPLETED: "success",
      CANCELLED: "danger",
      INSPECTION_REQUIRED: "warning",
      MAINTENANCE_REQUIRED: "danger",
    };
    return `bg-${variants[status] || "secondary"}`;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      URGENT: "danger",
      HIGH: "warning",
      MEDIUM: "info",
      LOW: "success",
    };
    return `bg-${variants[priority] || "secondary"}`;
  };

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
                <h1 className="h2 mb-0 text-dark">{task.title}</h1>
                <p className="text-muted mb-0">
                  Task ID: {task.id} • Created:{" "}
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Link
                  href={`/admin/tasks/${taskId}/edit`}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Task
                </Link>
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    Actions
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => updateTaskStatus("IN_PROGRESS")}
                        disabled={task.status === "IN_PROGRESS"}
                      >
                        <Clock size={16} className="me-2" />
                        Start Task
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => updateTaskStatus("COMPLETED")}
                        disabled={task.status === "COMPLETED"}
                      >
                        <CheckCircle size={16} className="me-2" />
                        Mark Complete
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-success"
                        onClick={() => createFollowupTask("INSPECTION")}
                      >
                        <ClipboardCheck size={16} className="me-2" />
                        Create Inspection
                      </button>
                    </li>
                    {task.type === "CLEANING" &&
                      task.status === "COMPLETED" && (
                        <Link
                          href={`/admin/tasks/${task.id}/inspect`}
                          className="btn btn-success d-flex align-items-center gap-2"
                        >
                          <ClipboardCheck size={16} />
                          Perform Inspection
                        </Link>
                      )}
                    {task.type === "INSPECTION" &&
                      task.status === "PENDING" && (
                        <Link
                          href={`/admin/tasks/${task.id}/inspect`}
                          className="btn btn-success d-flex align-items-center gap-2"
                        >
                          <ClipboardCheck size={16} />
                          Start Inspection
                        </Link>
                      )}
                    <li>
                      <button
                        className="dropdown-item text-warning"
                        onClick={() => createFollowupTask("MAINTENANCE")}
                      >
                        <Wrench size={16} className="me-2" />
                        Create Maintenance
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => updateTaskStatus("CANCELLED")}
                        disabled={task.status === "CANCELLED"}
                      >
                        <XCircle size={16} className="me-2" />
                        Cancel Task
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="d-flex flex-column">
                      <small className="text-muted">STATUS</small>
                      <span
                        className={`badge ${getStatusBadge(task.status)} fs-6`}
                      >
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex flex-column">
                      <small className="text-muted">PRIORITY</small>
                      <span
                        className={`badge ${getPriorityBadge(
                          task.priority
                        )} fs-6`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex flex-column">
                      <small className="text-muted">TYPE</small>
                      <span className="fs-6">{task.type}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex flex-column">
                      <small className="text-muted">ASSIGNED TO</small>
                      {task.assignedTo ? (
                        <div className="d-flex align-items-center gap-2">
                          <Users size={16} />
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Main Content */}
          <div className="col-lg-8">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "details" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  <FileText size={16} className="me-1" />
                  Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "notes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("notes")}
                >
                  <MessageSquare size={16} className="me-1" />
                  Notes ({task.taskNotes?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <History size={16} className="me-1" />
                  History
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "related" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("related")}
                >
                  <ChevronRight size={16} className="me-1" />
                  Related Tasks
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="mb-3">Description</h5>
                      <p className="text-muted">
                        {task.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-2">
                        <Building size={16} className="me-2" />
                        Location
                      </h6>
                      <div className="d-flex flex-column">
                        <strong>{task.building?.name}</strong>
                        <span>
                          {task.unit?.title} • Floor {task.unit?.floor}
                        </span>
                        <small className="text-muted">
                          {task.unit?.location}
                        </small>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-2">
                        <Calendar size={16} className="me-2" />
                        Schedule
                      </h6>
                      <div className="d-flex flex-column">
                        <div>
                          <strong>Due Date:</strong>{" "}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </div>
                        <div>
                          <strong>Estimated Time:</strong>{" "}
                          {task.estimatedMinutes
                            ? `${task.estimatedMinutes} minutes`
                            : "Not estimated"}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                        {task.completedAt && (
                          <div>
                            <strong>Completed:</strong>{" "}
                            {new Date(task.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {task.maintenanceType && (
                      <div className="col-md-6 mb-3">
                        <h6 className="text-muted mb-2">
                          <Wrench size={16} className="me-2" />
                          Maintenance Details
                        </h6>
                        <div className="d-flex flex-column">
                          <strong>Type:</strong> {task.maintenanceType}
                          {task.costEstimate && (
                            <div className="mt-1">
                              <strong>Cost Estimate:</strong> $
                              {task.costEstimate}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted mb-2">
                        <UserCheck size={16} className="me-2" />
                        Assignment
                      </h6>
                      <div className="d-flex flex-column">
                        <div>
                          <strong>Created By:</strong>{" "}
                          {task.createdBy?.name || "Unknown"}
                        </div>
                        <div>
                          <strong>Assigned To:</strong>{" "}
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        {task.escalatedTo && (
                          <div>
                            <strong>Escalated To:</strong>{" "}
                            {task.escalatedTo.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {task.notes && (
                      <div className="col-12 mb-3">
                        <h6 className="text-muted mb-2">
                          <FileText size={16} className="me-2" />
                          Additional Notes
                        </h6>
                        <p className="mb-0">{task.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="mb-3">Add Note</h5>
                  <div className="mb-4">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add a note about this task..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <div className="mt-2 d-flex justify-content-end">
                      <button
                        className="btn btn-primary"
                        onClick={addTaskNote}
                        disabled={addingNote || !newNote.trim()}
                      >
                        {addingNote ? "Adding..." : "Add Note"}
                      </button>
                    </div>
                  </div>

                  <h5 className="mb-3">Task Notes</h5>
                  {task.taskNotes && task.taskNotes.length > 0 ? (
                    <div className="list-group">
                      {task.taskNotes.map((note) => (
                        <div key={note.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="me-3">
                              <div className="d-flex align-items-center mb-1">
                                <strong>{note.createdBy?.name}</strong>
                                <small className="text-muted ms-2">
                                  {new Date(note.createdAt).toLocaleString()}
                                </small>
                                <span
                                  className={`badge bg-${
                                    note.type === "INTERNAL"
                                      ? "info"
                                      : "warning"
                                  } ms-2`}
                                >
                                  {note.type}
                                </span>
                              </div>
                              <p className="mb-0">{note.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No notes yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "related" && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row">
                    {/* Inspections */}
                    <div className="col-md-6 mb-4">
                      <h5 className="d-flex justify-content-between align-items-center mb-3">
                        <span>
                          <ClipboardCheck size={18} className="me-2" />
                          Recent Inspections
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => createFollowupTask("INSPECTION")}
                        >
                          <PlusCircle size={14} className="me-1" />
                          New Inspection
                        </button>
                      </h5>
                      {inspections.length > 0 ? (
                        <div className="list-group">
                          {inspections.map((inspection) => (
                            <Link
                              key={inspection.id}
                              href={`/admin/tasks/${inspection.id}`}
                              className="list-group-item list-group-item-action"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{inspection.title}</strong>
                                  <div className="small text-muted">
                                    {new Date(
                                      inspection.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <span
                                  className={`badge ${getStatusBadge(
                                    inspection.status
                                  )}`}
                                >
                                  {inspection.status}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-muted">No inspections found</p>
                        </div>
                      )}
                    </div>

                    {/* Maintenance Tasks */}
                    <div className="col-md-6 mb-4">
                      <h5 className="d-flex justify-content-between align-items-center mb-3">
                        <span>
                          <Wrench size={18} className="me-2" />
                          Maintenance History
                        </span>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => createFollowupTask("MAINTENANCE")}
                        >
                          <PlusCircle size={14} className="me-1" />
                          New Maintenance
                        </button>
                      </h5>
                      {maintenanceTasks.length > 0 ? (
                        <div className="list-group">
                          {maintenanceTasks.map((maintenance) => (
                            <Link
                              key={maintenance.id}
                              href={`/admin/tasks/${maintenance.id}`}
                              className="list-group-item list-group-item-action"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{maintenance.title}</strong>
                                  <div className="small text-muted">
                                    {maintenance.maintenanceType}
                                  </div>
                                </div>
                                <span
                                  className={`badge ${getStatusBadge(
                                    maintenance.status
                                  )}`}
                                >
                                  {maintenance.status}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-muted">No maintenance tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="col-lg-4">
            {/* Quick Actions */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  {task.status !== "COMPLETED" &&
                    task.status !== "CANCELLED" && (
                      <>
                        {task.status !== "IN_PROGRESS" && (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => updateTaskStatus("IN_PROGRESS")}
                          >
                            <Clock size={16} className="me-2" />
                            Start Task
                          </button>
                        )}
                        <button
                          className="btn btn-outline-success"
                          onClick={() => updateTaskStatus("COMPLETED")}
                        >
                          <CheckCircle size={16} className="me-2" />
                          Mark Complete
                        </button>
                      </>
                    )}
                  <button
                    className="btn btn-outline-info"
                    onClick={() => createFollowupTask("INSPECTION")}
                  >
                    <ClipboardCheck size={16} className="me-2" />
                    Create Inspection
                  </button>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => createFollowupTask("MAINTENANCE")}
                  >
                    <Wrench size={16} className="me-2" />
                    Create Maintenance
                  </button>
                  {task.status !== "CANCELLED" && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => updateTaskStatus("CANCELLED")}
                    >
                      <XCircle size={16} className="me-2" />
                      Cancel Task
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Task Timeline</h5>
              </div>
              <div className="card-body">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Task Created</h6>
                      <p className="text-muted small mb-0">
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                      <small>By: {task.createdBy?.name}</small>
                    </div>
                  </div>
                  {task.assignedTo && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-info"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">Assigned</h6>
                        <p className="text-muted small mb-0">
                          To: {task.assignedTo.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {task.startedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-warning"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">Started</h6>
                        <p className="text-muted small mb-0">
                          {new Date(task.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">Completed</h6>
                        <p className="text-muted small mb-0">
                          {new Date(task.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Information */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Unit Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">BUILDING</h6>
                  <p className="mb-1">{task.building?.name}</p>
                  <small className="text-muted">{task.building?.address}</small>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">UNIT</h6>
                  <p className="mb-1">{task.unit?.title}</p>
                  <small className="text-muted">
                    Floor {task.unit?.floor} • {task.unit?.bedrooms} bedrooms
                  </small>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">UNIT STATUS</h6>
                  <span
                    className={`badge bg-${
                      task.unit?.status === "AVAILABLE" ? "success" : "warning"
                    }`}
                  >
                    {task.unit?.status}
                  </span>
                </div>
                <div className="d-grid">
                  <Link
                    href={`/admin/units/${task.unitId}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Unit Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
