// app/[locale]/admin/tasks/[id]/inspect/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Save,
  PlusCircle,
} from "lucide-react";

// Pre-defined inspection checklist
const INSPECTION_CHECKLIST = [
  {
    category: "Living Area",
    items: [
      { id: "living_floor", label: "Floor cleaned and mopped", points: 5 },
      { id: "living_windows", label: "Windows and glass cleaned", points: 3 },
      {
        id: "living_furniture",
        label: "Furniture dusted and arranged",
        points: 4,
      },
      { id: "living_electronics", label: "Electronics cleaned", points: 2 },
    ],
  },
  {
    category: "Kitchen",
    items: [
      {
        id: "kitchen_counter",
        label: "Countertops cleaned and sanitized",
        points: 5,
      },
      { id: "kitchen_sink", label: "Sink cleaned and polished", points: 3 },
      {
        id: "kitchen_appliances",
        label: "Appliances cleaned inside and out",
        points: 4,
      },
      { id: "kitchen_cabinets", label: "Cabinets wiped down", points: 2 },
    ],
  },
  {
    category: "Bathroom",
    items: [
      {
        id: "bathroom_toilet",
        label: "Toilet cleaned and sanitized",
        points: 5,
      },
      { id: "bathroom_shower", label: "Shower/tub cleaned", points: 4 },
      { id: "bathroom_sink", label: "Sink and mirror cleaned", points: 3 },
      { id: "bathroom_floor", label: "Floor mopped", points: 2 },
    ],
  },
  {
    category: "Bedroom",
    items: [
      { id: "bedroom_bed", label: "Bed made properly", points: 3 },
      { id: "bedroom_linen", label: "Linen changed if required", points: 4 },
      { id: "bedroom_surfaces", label: "All surfaces dusted", points: 2 },
      { id: "bedroom_closet", label: "Closet organized", points: 2 },
    ],
  },
  {
    category: "Safety & Maintenance",
    items: [
      { id: "safety_smoke", label: "Smoke detectors functional", points: 10 },
      { id: "safety_lights", label: "All lights working", points: 5 },
      { id: "safety_ac", label: "AC/heating functional", points: 8 },
      { id: "safety_plumbing", label: "No plumbing issues", points: 7 },
    ],
  },
];

export default function TaskInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
      // Initialize checklist
      const initialChecklist = INSPECTION_CHECKLIST.flatMap((category) =>
        category.items.map((item) => ({
          ...item,
          category: category.category,
          checked: false,
          notes: "",
          photos: [],
        }))
      );
      setChecklist(initialChecklist);
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data.task);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckItem = (itemId) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addIssue = () => {
    setIssues((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        priority: "MEDIUM",
        requiresMaintenance: false,
      },
    ]);
  };

  const updateIssue = (issueId, field, value) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, [field]: value } : issue
      )
    );
  };

  const calculateScore = () => {
    const totalPoints = checklist.reduce((sum, item) => sum + item.points, 0);
    const earnedPoints = checklist
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.points, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const submitInspection = async () => {
    setSaving(true);
    try {
      const score = calculateScore();
      const inspectionData = {
        taskId,
        score,
        checklist,
        notes,
        issues,
        status: score >= 80 ? "PASSED" : "FAILED",
      };

      const response = await fetch(`/api/tasks/${taskId}/inspect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inspectionData),
      });

      if (response.ok) {
        const result = await response.json();

        // Create maintenance tasks for failed items with issues
        if (result.requiresMaintenance && result.maintenanceTaskId) {
          router.push(`/admin/tasks/${result.maintenanceTaskId}`);
        } else {
          router.push(`/admin/tasks/${taskId}`);
        }
      }
    } catch (error) {
      console.error("Error submitting inspection:", error);
    } finally {
      setSaving(false);
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

  const score = calculateScore();

  return (
    <LayoutAdmin>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <button
                  onClick={() => router.back()}
                  className="btn btn-outline-secondary mb-3 d-flex align-items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <h1 className="h2 mb-0">Unit Inspection</h1>
                <p className="text-muted mb-0">
                  {task?.unit?.title} • {task?.building?.name}
                </p>
              </div>
              <div className="text-end">
                <div className="display-4 fw-bold text-primary">{score}%</div>
                <small className="text-muted">Inspection Score</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Checklist */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Inspection Checklist</h5>
              </div>
              <div className="card-body">
                {INSPECTION_CHECKLIST.map((category, catIndex) => (
                  <div key={catIndex} className="mb-4">
                    <h6 className="mb-3 border-bottom pb-2">
                      {category.category}
                    </h6>
                    <div className="row">
                      {category.items.map((item, itemIndex) => {
                        const checklistItem = checklist.find(
                          (c) => c.id === item.id
                        );
                        return (
                          <div key={item.id} className="col-md-6 mb-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={item.id}
                                checked={checklistItem?.checked || false}
                                onChange={() => handleCheckItem(item.id)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={item.id}
                              >
                                {item.label}
                                <span className="badge bg-light text-dark ms-2">
                                  {item.points} pts
                                </span>
                              </label>
                            </div>
                            {checklistItem && (
                              <textarea
                                className="form-control form-control-sm mt-2"
                                rows="2"
                                placeholder="Notes..."
                                value={checklistItem.notes}
                                onChange={(e) => {
                                  setChecklist((prev) =>
                                    prev.map((c) =>
                                      c.id === item.id
                                        ? { ...c, notes: e.target.value }
                                        : c
                                    )
                                  );
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Maintenance */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Issues Found</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={addIssue}
                >
                  <PlusCircle size={14} className="me-1" />
                  Add Issue
                </button>
              </div>
              <div className="card-body">
                {issues.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle size={48} className="text-success mb-3" />
                    <p className="text-muted">No issues found</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {issues.map((issue, index) => (
                      <div key={issue.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1 me-3">
                            <div className="d-flex align-items-center mb-2">
                              <strong className="me-2">
                                Issue #{index + 1}
                              </strong>
                              <select
                                className="form-select form-select-sm w-auto"
                                value={issue.priority}
                                onChange={(e) =>
                                  updateIssue(
                                    issue.id,
                                    "priority",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                              </select>
                            </div>
                            <textarea
                              className="form-control mb-2"
                              rows="2"
                              placeholder="Describe the issue..."
                              value={issue.description}
                              onChange={(e) =>
                                updateIssue(
                                  issue.id,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={issue.requiresMaintenance}
                                onChange={(e) =>
                                  updateIssue(
                                    issue.id,
                                    "requiresMaintenance",
                                    e.target.checked
                                  )
                                }
                              />
                              <label className="form-check-label">
                                Requires maintenance task
                              </label>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setIssues((prev) =>
                                prev.filter((i) => i.id !== issue.id)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* General Notes */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Inspection Notes</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Add general notes about the inspection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Summary Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Inspection Summary</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">SCORE</h6>
                  <div className="d-flex align-items-center">
                    <div
                      className="progress flex-grow-1"
                      style={{ height: "20px" }}
                    >
                      <div
                        className={`progress-bar ${
                          score >= 80
                            ? "bg-success"
                            : score >= 60
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="ms-2 fw-bold">{score}%</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted small mb-2">STATUS</h6>
                  <div
                    className={`alert ${
                      score >= 80 ? "alert-success" : "alert-danger"
                    }`}
                  >
                    <strong>{score >= 80 ? "PASSED" : "FAILED"}</strong>
                    {score < 80 && (
                      <div className="mt-1 small">
                        Requires re-cleaning or maintenance
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted small mb-2">CHECKLIST PROGRESS</h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Completed Items</span>
                    <span>
                      {checklist.filter((item) => item.checked).length} /{" "}
                      {checklist.length}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted small mb-2">ISSUES FOUND</h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Total Issues</span>
                    <span>{issues.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Requiring Maintenance</span>
                    <span>
                      {issues.filter((i) => i.requiresMaintenance).length}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2 mt-4">
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={submitInspection}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner-border spinner-border-sm"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Submit Inspection
                      </>
                    )}
                  </button>

                  {issues.filter((i) => i.requiresMaintenance).length > 0 && (
                    <button
                      className="btn btn-warning d-flex align-items-center justify-content-center gap-2"
                      onClick={async () => {
                        // Create maintenance tasks for issues
                        await submitInspection();
                      }}
                    >
                      <AlertCircle size={16} />
                      Submit & Create Maintenance Tasks
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => router.push(`/admin/tasks/${taskId}`)}
                  >
                    Back to Task
                  </button>
                  <button
                    className="btn btn-outline-info"
                    onClick={() => {
                      // Take photo functionality
                      console.log("Take photo");
                    }}
                  >
                    <Camera size={16} className="me-2" />
                    Take Photo
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure? This will reset all progress."
                        )
                      ) {
                        setChecklist((prev) =>
                          prev.map((item) => ({
                            ...item,
                            checked: false,
                            notes: "",
                          }))
                        );
                        setIssues([]);
                        setNotes("");
                      }
                    }}
                  >
                    Reset Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
