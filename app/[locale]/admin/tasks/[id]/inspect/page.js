// app/[locale]/admin/tasks/[id]/inspect/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Clock,
  Star,
} from "lucide-react";

// Enhanced inspection checklist with categories and weights
const INSPECTION_CHECKLIST = [
  {
    id: "living_area",
    name: "Living Area",
    weight: 25,
    items: [
      {
        id: "living_floor",
        label: "Floor cleaned and mopped",
        maxScore: 10,
        notes: "",
      },
      {
        id: "living_windows",
        label: "Windows and glass cleaned",
        maxScore: 8,
        notes: "",
      },
      {
        id: "living_furniture",
        label: "Furniture dusted and arranged",
        maxScore: 7,
        notes: "",
      },
      {
        id: "living_electronics",
        label: "Electronics cleaned",
        maxScore: 5,
        notes: "",
      },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    weight: 25,
    items: [
      {
        id: "kitchen_counter",
        label: "Countertops cleaned and sanitized",
        maxScore: 10,
        notes: "",
      },
      {
        id: "kitchen_sink",
        label: "Sink cleaned and polished",
        maxScore: 7,
        notes: "",
      },
      {
        id: "kitchen_appliances",
        label: "Appliances cleaned inside and out",
        maxScore: 8,
        notes: "",
      },
      {
        id: "kitchen_cabinets",
        label: "Cabinets wiped down",
        maxScore: 5,
        notes: "",
      },
    ],
  },
  {
    id: "bathroom",
    name: "Bathroom",
    weight: 20,
    items: [
      {
        id: "bathroom_toilet",
        label: "Toilet cleaned and sanitized",
        maxScore: 10,
        notes: "",
      },
      {
        id: "bathroom_shower",
        label: "Shower/tub cleaned",
        maxScore: 8,
        notes: "",
      },
      {
        id: "bathroom_sink",
        label: "Sink and mirror cleaned",
        maxScore: 6,
        notes: "",
      },
      { id: "bathroom_floor", label: "Floor mopped", maxScore: 6, notes: "" },
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    weight: 15,
    items: [
      { id: "bedroom_bed", label: "Bed made properly", maxScore: 6, notes: "" },
      {
        id: "bedroom_linen",
        label: "Linen changed if required",
        maxScore: 5,
        notes: "",
      },
      {
        id: "bedroom_surfaces",
        label: "All surfaces dusted",
        maxScore: 4,
        notes: "",
      },
      {
        id: "bedroom_closet",
        label: "Closet organized",
        maxScore: 5,
        notes: "",
      },
    ],
  },
  {
    id: "safety_maintenance",
    name: "Safety & Maintenance",
    weight: 15,
    items: [
      {
        id: "safety_smoke",
        label: "Smoke detectors functional",
        maxScore: 10,
        notes: "",
      },
      {
        id: "safety_lights",
        label: "All lights working",
        maxScore: 8,
        notes: "",
      },
      {
        id: "safety_ac",
        label: "AC/heating functional",
        maxScore: 7,
        notes: "",
      },
      {
        id: "safety_plumbing",
        label: "No plumbing issues",
        maxScore: 10,
        notes: "",
      },
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
  const [savingDraft, setSavingDraft] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [issues, setIssues] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // Load task and any existing inspection
  useEffect(() => {
    if (taskId) {
      fetchTaskAndInspections();
      loadDraft();
    }
  }, [taskId]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchTaskAndInspections = async () => {
    try {
      setLoading(true);
      const [taskRes, inspectionsRes] = await Promise.all([
        fetch(`/api/tasks/${taskId}`),
        fetch(`/api/tasks/${taskId}/inspections`),
      ]);

      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTask(taskData.task);
      }

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        setInspections(inspectionsData.inspections || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(`inspection_draft_${taskId}`);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setChecklist(
        draft.checklist ||
          INSPECTION_CHECKLIST.map((category) => ({
            ...category,
            items: category.items.map((item) => ({
              ...item,
              score: 0,
              notes: "",
            })),
          }))
      );
      setIssues(draft.issues || []);
      setNotes(draft.notes || "");
      setHasUnsavedChanges(true);
    } else {
      // Initialize fresh checklist
      setChecklist(
        INSPECTION_CHECKLIST.map((category) => ({
          ...category,
          items: category.items.map((item) => ({
            ...item,
            score: 0,
            notes: "",
          })),
        }))
      );
    }
  };

  const saveDraft = useCallback(async () => {
    const draft = {
      taskId,
      checklist,
      issues,
      notes,
      photos,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(`inspection_draft_${taskId}`, JSON.stringify(draft));
    setHasUnsavedChanges(false);

    // Optionally save to server
    try {
      setSavingDraft(true);
      await fetch(`/api/tasks/${taskId}/inspect/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
    } catch (error) {
      console.error("Error saving draft to server:", error);
    } finally {
      setSavingDraft(false);
    }
  }, [taskId, checklist, issues, notes, photos]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, saveDraft]);

  const handleScoreChange = (categoryId, itemId, score) => {
    setChecklist((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  score: Math.min(Math.max(0, score), item.maxScore),
                };
              }
              return item;
            }),
          };
        }
        return category;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleNotesChange = (categoryId, itemId, notes) => {
    setChecklist((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, notes };
              }
              return item;
            }),
          };
        }
        return category;
      })
    );
    setHasUnsavedChanges(true);
  };

  const addIssue = () => {
    const newIssue = {
      id: Date.now(),
      description: "",
      category: "general",
      priority: "MEDIUM",
      requiresMaintenance: false,
      estimatedCost: "",
      photos: [],
    };
    setIssues((prev) => [...prev, newIssue]);
    setHasUnsavedChanges(true);
  };

  const updateIssue = (issueId, field, value) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, [field]: value } : issue
      )
    );
    setHasUnsavedChanges(true);
  };

  const removeIssue = (issueId) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
    setHasUnsavedChanges(true);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you would upload to a storage service
    const newPhotos = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
      timestamp: new Date().toISOString(),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setHasUnsavedChanges(true);
  };

  const removePhoto = (photoId) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    setHasUnsavedChanges(true);
  };

  const calculateScores = () => {
    let totalPossible = 0;
    let totalEarned = 0;
    const categoryScores = [];

    checklist.forEach((category) => {
      let categoryPossible = 0;
      let categoryEarned = 0;

      category.items.forEach((item) => {
        categoryPossible += item.maxScore;
        categoryEarned += item.score || 0;
      });

      const categoryPercentage =
        categoryPossible > 0 ? (categoryEarned / categoryPossible) * 100 : 0;
      totalPossible += categoryPossible * (category.weight / 100);
      totalEarned += categoryEarned * (category.weight / 100);

      categoryScores.push({
        name: category.name,
        earned: categoryEarned,
        possible: categoryPossible,
        percentage: Math.round(categoryPercentage),
        weight: category.weight,
      });
    });

    const overallPercentage =
      totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    return {
      overall: Math.round(overallPercentage),
      totalEarned: Math.round(totalEarned),
      totalPossible: Math.round(totalPossible),
      categoryScores,
    };
  };

  const submitInspection = async (status = "COMPLETED") => {
    if (!window.confirm("Submit inspection? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    try {
      const scores = calculateScores();
      const inspectionData = {
        taskId,
        score: scores.overall,
        checklist,
        notes,
        issues: issues.filter((issue) => issue.description.trim() !== ""),
        photos: photos.map((photo) => photo.url),
        status: scores.overall >= 80 ? "PASSED" : "FAILED",
        submittedAt: new Date().toISOString(),
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

        // Clear local draft
        localStorage.removeItem(`inspection_draft_${taskId}`);
        setHasUnsavedChanges(false);

        // Show success message
        alert(
          `Inspection submitted successfully with score: ${scores.overall}%`
        );

        if (result.requiresMaintenance && result.maintenanceTaskId) {
          if (
            window.confirm(
              "Maintenance tasks were created. Would you like to view them now?"
            )
          ) {
            router.push(`/admin/tasks/${result.maintenanceTaskId}`);
          } else {
            router.push(`/admin/tasks/${taskId}`);
          }
        } else {
          router.push(`/admin/tasks/${taskId}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit inspection");
      }
    } catch (error) {
      console.error("Error submitting inspection:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveAsDraft = async () => {
    await saveDraft();
    alert("Draft saved successfully!");
  };

  const loadPreviousInspection = (inspection) => {
    if (
      window.confirm(
        "Load this inspection as a template? Current unsaved changes will be lost."
      )
    ) {
      setChecklist(inspection.checklist);
      setIssues(inspection.issues || []);
      setNotes(inspection.notes || "");
      setHasUnsavedChanges(true);
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

  if (!task) {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div className="alert alert-danger">
            Task not found or you don't have permission to inspect it.
          </div>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </LayoutAdmin>
    );
  }

  // Check if task can be inspected
  if (task.type !== "INSPECTION" && task.type !== "CLEANING") {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div className="alert alert-warning">
            <AlertCircle className="me-2" />
            This task type ({task.type}) cannot be inspected. Only Cleaning and
            Inspection tasks can be inspected.
          </div>
          <button
            onClick={() => router.push(`/admin/tasks/${taskId}`)}
            className="btn btn-primary"
          >
            Back to Task
          </button>
        </div>
      </LayoutAdmin>
    );
  }

  const scores = calculateScores();
  const passed = scores.overall >= 80;

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
                  {task?.unit?.title} • {task?.building?.name} • Floor{" "}
                  {task?.unit?.floor}
                </p>
              </div>
              <div className="text-end">
                <div className="display-4 fw-bold text-primary">
                  {scores.overall}%
                </div>
                <small className="text-muted">
                  Score: {scores.totalEarned}/{scores.totalPossible} points
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Alert */}
        {hasUnsavedChanges && (
          <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-4">
            <AlertCircle className="me-2" size={20} />
            <div>You have unsaved changes</div>
            <div className="ms-auto">
              <button
                onClick={saveAsDraft}
                className="btn btn-sm btn-outline-primary me-2"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
            </div>
          </div>
        )}

        {/* Previous Inspections */}
        {inspections.length > 0 && (
          <div className="alert alert-info mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Previous Inspections Found:</strong> This unit has been
                inspected {inspections.length} time(s) before.
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                >
                  {showScoreBreakdown ? "Hide Details" : "Show Details"}
                </button>
              </div>
            </div>
            {showScoreBreakdown && (
              <div className="mt-3">
                {inspections.map((inspection, idx) => (
                  <div key={inspection.id} className="mb-2 p-2 border rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Inspection #{idx + 1}</strong>:{" "}
                        {inspection.score}% • {inspection.status}
                        <br />
                        <small className="text-muted">
                          By {inspection.inspector?.name} on{" "}
                          {new Date(inspection.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        onClick={() => loadPreviousInspection(inspection)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Use as Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">
            {/* Inspection Checklist */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Inspection Checklist</h5>
                <small className="text-muted">
                  Rate each item (0 to max points)
                </small>
              </div>
              <div className="card-body">
                {checklist.map((category) => (
                  <div key={category.id} className="mb-4 border-bottom pb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">{category.name}</h6>
                      <small className="text-muted">
                        Weight: {category.weight}% • Score:{" "}
                        {category.items.reduce(
                          (sum, item) => sum + (item.score || 0),
                          0
                        )}
                        /
                        {category.items.reduce(
                          (sum, item) => sum + item.maxScore,
                          0
                        )}
                      </small>
                    </div>
                    <div className="row">
                      {category.items.map((item) => (
                        <div key={item.id} className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <label
                              className="form-check-label fw-medium"
                              htmlFor={`score-${item.id}`}
                            >
                              {item.label}
                            </label>
                            <small className="text-muted">
                              Max: {item.maxScore} pts
                            </small>
                          </div>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <input
                              type="range"
                              id={`score-${item.id}`}
                              min="0"
                              max={item.maxScore}
                              value={item.score || 0}
                              onChange={(e) =>
                                handleScoreChange(
                                  category.id,
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="form-range"
                              style={{ flex: 1 }}
                            />
                            <span
                              className="badge bg-primary"
                              style={{ minWidth: "40px" }}
                            >
                              {item.score || 0}
                            </span>
                          </div>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            placeholder="Notes for this item..."
                            value={item.notes}
                            onChange={(e) =>
                              handleNotesChange(
                                category.id,
                                item.id,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ))}
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
                                className="form-select form-select-sm w-auto me-2"
                                value={issue.category}
                                onChange={(e) =>
                                  updateIssue(
                                    issue.id,
                                    "category",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="general">General</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="safety">Safety</option>
                                <option value="cosmetic">Cosmetic</option>
                              </select>
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
                              placeholder="Describe the issue in detail..."
                              value={issue.description}
                              onChange={(e) =>
                                updateIssue(
                                  issue.id,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-check mb-2">
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
                              {issue.requiresMaintenance && (
                                <div className="col-md-6">
                                  <div className="input-group input-group-sm">
                                    <span className="input-group-text">$</span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="Estimated cost"
                                      value={issue.estimatedCost}
                                      onChange={(e) =>
                                        updateIssue(
                                          issue.id,
                                          "estimatedCost",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeIssue(issue.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <Camera size={18} className="me-2" />
                  Photos
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="form-control"
                    id="photoUpload"
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="photoUpload"
                    className="btn btn-outline-primary"
                  >
                    <Upload size={16} className="me-2" />
                    Upload Photos
                  </label>
                  <small className="text-muted ms-2">
                    Max 10 photos, 5MB each
                  </small>
                </div>

                {photos.length > 0 && (
                  <div className="row">
                    {photos.map((photo) => (
                      <div key={photo.id} className="col-md-4 mb-3">
                        <div className="card">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="card-img-top"
                            style={{ height: "150px", objectFit: "cover" }}
                          />
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <small
                                className="text-truncate"
                                style={{ maxWidth: "150px" }}
                              >
                                {photo.name}
                              </small>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removePhoto(photo.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
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
                <h5 className="mb-0">General Notes & Recommendations</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Add overall notes, recommendations, or special instructions..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Summary Card */}
            <div
              className="card shadow-sm mb-4 sticky-top"
              style={{ top: "20px" }}
            >
              <div className="card-header bg-white">
                <h5 className="mb-0">Inspection Summary</h5>
              </div>
              <div className="card-body">
                {/* Overall Score */}
                <div className="mb-4 text-center">
                  <div
                    className={`display-1 fw-bold ${
                      passed ? "text-success" : "text-danger"
                    }`}
                  >
                    {scores.overall}%
                  </div>
                  <div
                    className={`badge ${
                      passed ? "bg-success" : "bg-danger"
                    } fs-5 mb-3`}
                  >
                    {passed ? "PASSED" : "FAILED"}
                  </div>
                  <div className="progress mb-3" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${
                        passed ? "bg-success" : "bg-danger"
                      }`}
                      style={{ width: `${scores.overall}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {scores.totalEarned} points earned of {scores.totalPossible}{" "}
                    possible
                  </small>
                </div>

                {/* Category Breakdown */}
                <div className="mb-4">
                  <h6 className="mb-3">Category Breakdown</h6>
                  {scores.categoryScores.map((category) => (
                    <div key={category.name} className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small>{category.name}</small>
                        <small>
                          {category.earned}/{category.possible} (
                          {category.percentage}%)
                        </small>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor:
                              category.percentage >= 80
                                ? "#28a745"
                                : category.percentage >= 60
                                ? "#ffc107"
                                : "#dc3545",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statistics */}
                <div className="mb-4">
                  <h6 className="mb-3">Statistics</h6>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">
                        Items Checked
                      </small>
                      <strong>
                        {
                          checklist
                            .flatMap((c) => c.items)
                            .filter((i) => i.score > 0).length
                        }
                        /{checklist.flatMap((c) => c.items).length}
                      </strong>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Issues Found</small>
                      <strong>{issues.length}</strong>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Photos</small>
                      <strong>{photos.length}</strong>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">
                        Requires Maintenance
                      </small>
                      <strong>
                        {issues.filter((i) => i.requiresMaintenance).length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={() => submitInspection()}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner-border spinner-border-sm"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Submit Inspection
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={saveAsDraft}
                    disabled={savingDraft}
                  >
                    {savingDraft ? (
                      <>
                        <div className="spinner-border spinner-border-sm"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save as Draft
                      </>
                    )}
                  </button>

                  {hasUnsavedChanges && (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => {
                        if (window.confirm("Discard all unsaved changes?")) {
                          localStorage.removeItem(`inspection_draft_${taskId}`);
                          window.location.reload();
                        }
                      }}
                    >
                      Reset to Last Saved
                    </button>
                  )}

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      if (
                        hasUnsavedChanges &&
                        !window.confirm(
                          "You have unsaved changes. Are you sure you want to leave?"
                        )
                      ) {
                        return;
                      }
                      router.push(`/admin/tasks/${taskId}`);
                    }}
                  >
                    Cancel & Return
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Status */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Task Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">UNIT</h6>
                  <p className="mb-1">
                    <strong>{task.unit?.title}</strong>
                  </p>
                  <small className="text-muted">
                    Floor {task.unit?.floor} • {task.building?.name}
                  </small>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">TASK</h6>
                  <p className="mb-1">{task.title}</p>
                  <small className="text-muted">Type: {task.type}</small>
                </div>
                {task.assignedTo && (
                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">ASSIGNED TO</h6>
                    <p className="mb-0">{task.assignedTo.name}</p>
                  </div>
                )}
                <div className="d-grid">
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => router.push(`/admin/units/${task.unitId}`)}
                  >
                    View Unit Details
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
