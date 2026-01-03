// app/[locale]/admin/inspections/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import {
  ArrowLeft,
  Eye,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Home,
  Building,
  AlertCircle,
  FileText,
  Star,
  BarChart3,
  TrendingUp,
  Clock,
  Wrench,
  ClipboardCheck,
  ChevronRight,
  Filter,
  RefreshCw,
  Tag,
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.id;
  const [inspection, setInspection] = useState(null);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("checklist");
  const [scoreBreakdown, setScoreBreakdown] = useState(null);

  useEffect(() => {
    if (inspectionId) {
      fetchInspectionData();
    }
  }, [inspectionId]);

  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      const [inspectionRes, relatedRes] = await Promise.all([
        fetch(`/api/inspections/${inspectionId}`),
        fetch(`/api/inspections/${inspectionId}/related`),
      ]);

      if (inspectionRes.ok) {
        const inspectionData = await inspectionRes.json();
        setInspection(inspectionData.inspection);

        // Calculate score breakdown if checklist exists
        if (inspectionData.inspection?.checklist) {
          calculateScoreBreakdown(inspectionData.inspection.checklist);
        }
      }

      if (relatedRes.ok) {
        const relatedData = await relatedRes.json();
        setRelatedTasks(relatedData.tasks || []);
        setMaintenanceTasks(relatedData.maintenanceTasks || []);
      }
    } catch (error) {
      console.error("Error fetching inspection data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScoreBreakdown = (checklist) => {
    if (!checklist || !Array.isArray(checklist)) return;

    const breakdown = {
      categories: [],
      totalPossible: 0,
      totalEarned: 0,
      categoryScores: [],
    };

    checklist.forEach((category) => {
      let categoryPossible = 0;
      let categoryEarned = 0;
      let categoryItems = 0;
      let perfectItems = 0;

      category.items.forEach((item) => {
        categoryPossible += item.maxScore;
        categoryEarned += item.score || 0;
        categoryItems++;
        if (item.score === item.maxScore) {
          perfectItems++;
        }
      });

      const categoryPercentage =
        categoryPossible > 0 ? (categoryEarned / categoryPossible) * 100 : 0;

      breakdown.totalPossible += categoryPossible;
      breakdown.totalEarned += categoryEarned;

      breakdown.categories.push({
        name: category.name,
        weight: category.weight || 0,
        possible: categoryPossible,
        earned: categoryEarned,
        percentage: Math.round(categoryPercentage),
        items: categoryItems,
        perfectItems,
        color:
          categoryPercentage >= 90
            ? "success"
            : categoryPercentage >= 70
            ? "warning"
            : "danger",
      });

      breakdown.categoryScores.push({
        name: category.name,
        score: Math.round(categoryPercentage),
        weight: category.weight || 0,
      });
    });

    breakdown.overallPercentage =
      breakdown.totalPossible > 0
        ? Math.round((breakdown.totalEarned / breakdown.totalPossible) * 100)
        : 0;

    setScoreBreakdown(breakdown);
  };

  const printReport = () => {
    window.print();
  };

  const exportPDF = () => {
    // In a real app, you would generate a PDF
    alert("PDF export functionality would be implemented here");
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-danger";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-danger";
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

  if (!inspection) {
    return (
      <LayoutAdmin>
        <div className="container-fluid">
          <div className="alert alert-danger">Inspection not found</div>
          <Link href="/admin/inspections" className="btn btn-primary">
            Back to Inspections
          </Link>
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
                  href="/admin/inspections"
                  className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
                >
                  <ArrowLeft size={16} />
                  <span className="text-muted">Back to Inspections</span>
                </Link>
                <h1 className="h2 mb-0 text-dark">Inspection Report</h1>
                <p className="text-muted mb-0">
                  Inspection ID: {inspection.id} •{" "}
                  {inspection.task?.unit?.title} •{" "}
                  {inspection.task?.building?.name}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={fetchInspectionData}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={printReport}
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={exportPDF}
                >
                  <Download size={16} />
                  Export PDF
                </button>
                {inspection.task && (
                  <Link
                    href={`/admin/tasks/${inspection.task.id}`}
                    className="btn btn-primary d-flex align-items-center gap-2"
                  >
                    <Eye size={16} />
                    View Task
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-4 text-center">
                    <div
                      className={`display-1 fw-bold ${getScoreColor(
                        inspection.score
                      )}`}
                    >
                      {inspection.score}%
                    </div>
                    <div
                      className={`badge ${getScoreBadgeColor(
                        inspection.score
                      )} fs-5 mb-2`}
                    >
                      {inspection.status}
                    </div>
                    {scoreBreakdown && (
                      <div className="text-muted small">
                        {scoreBreakdown.totalEarned} /{" "}
                        {scoreBreakdown.totalPossible} points
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-6 mb-3">
                        <h6 className="text-muted small mb-2">
                          <User size={14} className="me-1" />
                          INSPECTOR
                        </h6>
                        <p className="mb-0 fw-semibold">
                          {inspection.inspector?.name}
                        </p>
                        <p className="mb-0 text-muted small">
                          {inspection.inspector?.role}
                        </p>
                      </div>
                      <div className="col-6 mb-3">
                        <h6 className="text-muted small mb-2">
                          <Calendar size={14} className="me-1" />
                          DATE
                        </h6>
                        <p className="mb-0 fw-semibold">
                          {new Date(inspection.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mb-0 text-muted small">
                          {new Date(inspection.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="col-6">
                        <h6 className="text-muted small mb-2">
                          <Home size={14} className="me-1" />
                          UNIT
                        </h6>
                        <p className="mb-0 fw-semibold">
                          {inspection.task?.unit?.title}
                        </p>
                        <p className="mb-0 text-muted small">
                          Floor {inspection.task?.unit?.floor}
                        </p>
                      </div>
                      <div className="col-6">
                        <h6 className="text-muted small mb-2">
                          <Building size={14} className="me-1" />
                          BUILDING
                        </h6>
                        <p className="mb-0 fw-semibold">
                          {inspection.task?.building?.name}
                        </p>
                        <p className="mb-0 text-muted small">
                          {inspection.task?.building?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="text-muted mb-3">SCORE BREAKDOWN</h6>
                {scoreBreakdown ? (
                  <div>
                    {scoreBreakdown.categoryScores.map((category, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <small>{category.name}</small>
                          <small className="fw-semibold">
                            {category.score}%
                          </small>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar bg-${getScoreBadgeColor(
                              category.score
                            ).replace("bg-", "")}`}
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between">
                        <strong>Overall Score</strong>
                        <strong
                          className={getScoreColor(
                            scoreBreakdown.overallPercentage
                          )}
                        >
                          {scoreBreakdown.overallPercentage}%
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    No score breakdown available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "checklist" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("checklist")}
                >
                  <ClipboardCheck size={16} className="me-1" />
                  Checklist Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "issues" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("issues")}
                >
                  <AlertCircle size={16} className="me-1" />
                  Issues Found
                  {inspection.issues?.length > 0 && (
                    <span className="badge bg-danger ms-1">
                      {inspection.issues.length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "related" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("related")}
                >
                  <Filter size={16} className="me-1" />
                  Related Tasks
                  {(relatedTasks.length > 0 || maintenanceTasks.length > 0) && (
                    <span className="badge bg-info ms-1">
                      {relatedTasks.length + maintenanceTasks.length}
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "notes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("notes")}
                >
                  <FileText size={16} className="me-1" />
                  Notes & Photos
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {/* Checklist Tab */}
            {activeTab === "checklist" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  {inspection.checklist &&
                  Array.isArray(inspection.checklist) &&
                  inspection.checklist.length > 0 ? (
                    <div className="row">
                      <div className="col-lg-8">
                        {inspection.checklist.map((category, catIndex) => {
                          const categoryScore = category.items.reduce(
                            (sum, item) => sum + (item.score || 0),
                            0
                          );
                          const categoryPossible = category.items.reduce(
                            (sum, item) => sum + item.maxScore,
                            0
                          );
                          const categoryPercentage =
                            categoryPossible > 0
                              ? Math.round(
                                  (categoryScore / categoryPossible) * 100
                                )
                              : 0;

                          return (
                            <div key={catIndex} className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">{category.name}</h5>
                                <div className="text-end">
                                  <div className="fw-semibold">
                                    {categoryScore} / {categoryPossible} points
                                  </div>
                                  <div
                                    className={`small ${getScoreColor(
                                      categoryPercentage
                                    )}`}
                                  >
                                    {categoryPercentage}%
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                {category.items.map((item, itemIndex) => {
                                  const itemPercentage =
                                    item.maxScore > 0
                                      ? Math.round(
                                          ((item.score || 0) / item.maxScore) *
                                            100
                                        )
                                      : 0;

                                  return (
                                    <div
                                      key={itemIndex}
                                      className="col-md-6 mb-3"
                                    >
                                      <div className="card border-0 bg-light">
                                        <div className="card-body">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="fw-medium">
                                              {item.label}
                                            </span>
                                            <div className="text-end">
                                              <div className="d-flex align-items-center gap-2">
                                                <span
                                                  className={`badge ${
                                                    item.score === item.maxScore
                                                      ? "bg-success"
                                                      : "bg-warning"
                                                  }`}
                                                >
                                                  {item.score || 0}/
                                                  {item.maxScore}
                                                </span>
                                                <span
                                                  className={`small ${getScoreColor(
                                                    itemPercentage
                                                  )}`}
                                                >
                                                  {itemPercentage}%
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Progress bar for visual score representation */}
                                          <div
                                            className="progress mb-2"
                                            style={{ height: "4px" }}
                                          >
                                            <div
                                              className={`progress-bar ${
                                                item.score === item.maxScore
                                                  ? "bg-success"
                                                  : "bg-warning"
                                              }`}
                                              style={{
                                                width: `${itemPercentage}%`,
                                              }}
                                            ></div>
                                          </div>

                                          {/* Rating stars visualization */}
                                          <div className="d-flex align-items-center mb-2">
                                            <div className="me-2 small text-muted">
                                              Rating:
                                            </div>
                                            <div className="d-flex">
                                              {[...Array(5)].map(
                                                (_, starIndex) => {
                                                  const starValue =
                                                    ((item.score || 0) /
                                                      item.maxScore) *
                                                    5;
                                                  return (
                                                    <Star
                                                      key={starIndex}
                                                      size={14}
                                                      className={`me-1 ${
                                                        starIndex <
                                                        Math.floor(starValue)
                                                          ? "text-warning fill-warning"
                                                          : starIndex <
                                                            starValue
                                                          ? "text-warning fill-warning opacity-50"
                                                          : "text-muted"
                                                      }`}
                                                    />
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>

                                          {item.notes && (
                                            <div className="alert alert-light small mt-2 mb-0">
                                              <strong>Notes:</strong>{" "}
                                              {item.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Category summary */}
                              <div className="alert alert-light mt-3">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="small text-muted">
                                      Category Weight
                                    </div>
                                    <div className="fw-semibold">
                                      {category.weight || 0}%
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="small text-muted">
                                      Contribution to Total
                                    </div>
                                    <div className="fw-semibold">
                                      {Math.round(
                                        (categoryScore /
                                          (scoreBreakdown?.totalPossible ||
                                            1)) *
                                          100
                                      )}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Score Summary Sidebar */}
                      <div className="col-lg-4">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <h6 className="mb-3">
                              <BarChart3 size={18} className="me-2" />
                              Score Summary
                            </h6>

                            {scoreBreakdown && (
                              <>
                                {/* Overall Score Circle */}
                                <div className="text-center mb-4">
                                  <div className="position-relative d-inline-block">
                                    <svg
                                      width="120"
                                      height="120"
                                      className="mb-3"
                                    >
                                      <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="#e9ecef"
                                        strokeWidth="8"
                                      />
                                      <circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke={
                                          scoreBreakdown.overallPercentage >= 90
                                            ? "#28a745"
                                            : scoreBreakdown.overallPercentage >=
                                              70
                                            ? "#ffc107"
                                            : "#dc3545"
                                        }
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${
                                          (scoreBreakdown.overallPercentage /
                                            100) *
                                          339
                                        } 339`}
                                        transform="rotate(-90 60 60)"
                                      />
                                      <text
                                        x="60"
                                        y="60"
                                        textAnchor="middle"
                                        dy="7"
                                        fontSize="24"
                                        fontWeight="bold"
                                        fill={
                                          scoreBreakdown.overallPercentage >= 90
                                            ? "#28a745"
                                            : scoreBreakdown.overallPercentage >=
                                              70
                                            ? "#ffc107"
                                            : "#dc3545"
                                        }
                                      >
                                        {scoreBreakdown.overallPercentage}%
                                      </text>
                                      <text
                                        x="60"
                                        y="80"
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill="#6c757d"
                                      >
                                        Overall
                                      </text>
                                    </svg>
                                  </div>
                                </div>

                                {/* Statistics */}
                                <div className="mb-3">
                                  <h6 className="text-muted small mb-2">
                                    STATISTICS
                                  </h6>
                                  <div className="row">
                                    <div className="col-6 mb-2">
                                      <div className="small text-muted">
                                        Total Items
                                      </div>
                                      <div className="fw-semibold">
                                        {scoreBreakdown.categories.reduce(
                                          (sum, cat) => sum + cat.items,
                                          0
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                      <div className="small text-muted">
                                        Perfect Scores
                                      </div>
                                      <div className="fw-semibold">
                                        {scoreBreakdown.categories.reduce(
                                          (sum, cat) => sum + cat.perfectItems,
                                          0
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                      <div className="small text-muted">
                                        Points Earned
                                      </div>
                                      <div className="fw-semibold">
                                        {scoreBreakdown.totalEarned}
                                      </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                      <div className="small text-muted">
                                        Points Possible
                                      </div>
                                      <div className="fw-semibold">
                                        {scoreBreakdown.totalPossible}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Performance Indicators */}
                                <div className="mt-4">
                                  <h6 className="text-muted small mb-2">
                                    PERFORMANCE
                                  </h6>
                                  <div className="list-group list-group-flush">
                                    {scoreBreakdown.categories.map(
                                      (category, index) => (
                                        <div
                                          key={index}
                                          className="list-group-item px-0 py-2"
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                              <div className="small">
                                                {category.name}
                                              </div>
                                              <div className="text-muted smaller">
                                                {category.weight}% weight
                                              </div>
                                            </div>
                                            <div className="text-end">
                                              <div
                                                className={`fw-semibold text-${category.color}`}
                                              >
                                                {category.percentage}%
                                              </div>
                                              <div className="small text-muted">
                                                {category.earned}/
                                                {category.possible}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FileText size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">
                        No checklist data available
                      </h5>
                      <p className="text-muted">
                        This inspection doesn't have checklist data.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issues Tab */}
            {activeTab === "issues" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  {inspection.issues && inspection.issues.length > 0 ? (
                    <>
                      <div className="row mb-4">
                        <div className="col-md-4">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <div className="display-4 fw-bold text-danger">
                                {inspection.issues.length}
                              </div>
                              <div className="text-muted">Total Issues</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <div className="display-4 fw-bold text-warning">
                                {
                                  inspection.issues.filter(
                                    (i) => i.requiresMaintenance
                                  ).length
                                }
                              </div>
                              <div className="text-muted">
                                Require Maintenance
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <div className="display-4 fw-bold text-info">
                                {
                                  inspection.issues.filter(
                                    (i) =>
                                      i.priority === "HIGH" ||
                                      i.priority === "URGENT"
                                  ).length
                                }
                              </div>
                              <div className="text-muted">High Priority</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="list-group">
                        {inspection.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="list-group-item mb-3 border"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1 me-3">
                                <div className="d-flex align-items-center mb-2">
                                  <strong className="me-2">
                                    Issue #{index + 1}
                                  </strong>
                                  <span
                                    className={`badge bg-${getPriorityColor(
                                      issue.priority
                                    )} me-2`}
                                  >
                                    {issue.priority}
                                  </span>
                                  <span
                                    className={`badge bg-${
                                      issue.category === "safety"
                                        ? "danger"
                                        : issue.category === "maintenance"
                                        ? "warning"
                                        : "info"
                                    } me-2`}
                                  >
                                    <Tag size={10} className="me-1" />
                                    {issue.category || "general"}
                                  </span>
                                  {issue.requiresMaintenance && (
                                    <span className="badge bg-warning">
                                      <Wrench size={10} className="me-1" />
                                      Requires Maintenance
                                    </span>
                                  )}
                                </div>

                                <div className="mb-2">
                                  <strong>Description:</strong>
                                  <p className="mb-0 mt-1">
                                    {issue.description}
                                  </p>
                                </div>

                                <div className="row">
                                  {issue.estimatedCost && (
                                    <div className="col-md-3">
                                      <div className="small text-muted">
                                        Estimated Cost
                                      </div>
                                      <div className="fw-semibold">
                                        ${issue.estimatedCost}
                                      </div>
                                    </div>
                                  )}
                                  {issue.category && (
                                    <div className="col-md-3">
                                      <div className="small text-muted">
                                        Category
                                      </div>
                                      <div className="fw-semibold">
                                        {issue.category}
                                      </div>
                                    </div>
                                  )}
                                  <div className="col-md-3">
                                    <div className="small text-muted">
                                      Priority
                                    </div>
                                    <div className="fw-semibold">
                                      {issue.priority}
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="small text-muted">
                                      Action Required
                                    </div>
                                    <div className="fw-semibold">
                                      {issue.requiresMaintenance
                                        ? "Maintenance"
                                        : "Review"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <CheckCircle size={48} className="text-success mb-3" />
                      <h5 className="text-success">No Issues Found</h5>
                      <p className="text-muted">
                        Great job! No issues were reported in this inspection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Tasks Tab */}
            {activeTab === "related" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    {/* Related Cleaning/Inspection Tasks */}
                    <div className="col-lg-6 mb-4">
                      <h5 className="d-flex align-items-center mb-3">
                        <ClipboardCheck size={18} className="me-2" />
                        Related Inspection & Cleaning Tasks
                        <span className="badge bg-info ms-2">
                          {relatedTasks.length}
                        </span>
                      </h5>
                      {relatedTasks.length > 0 ? (
                        <div className="list-group">
                          {relatedTasks.map((task) => (
                            <Link
                              key={task.id}
                              href={`/admin/tasks/${task.id}`}
                              className="list-group-item list-group-item-action"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{task.title}</strong>
                                  <div className="small text-muted">
                                    {task.type} •{" "}
                                    {new Date(
                                      task.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className={`badge bg-${
                                      task.status === "COMPLETED"
                                        ? "success"
                                        : "warning"
                                    }`}
                                  >
                                    {task.status}
                                  </span>
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-light">
                          <p className="mb-0">
                            No related inspection or cleaning tasks found.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Maintenance Tasks Created from Issues */}
                    <div className="col-lg-6 mb-4">
                      <h5 className="d-flex align-items-center mb-3">
                        <Wrench size={18} className="me-2" />
                        Maintenance Tasks from Issues
                        <span className="badge bg-warning ms-2">
                          {maintenanceTasks.length}
                        </span>
                      </h5>
                      {maintenanceTasks.length > 0 ? (
                        <div className="list-group">
                          {maintenanceTasks.map((task) => (
                            <Link
                              key={task.id}
                              href={`/admin/tasks/${task.id}`}
                              className="list-group-item list-group-item-action"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{task.title}</strong>
                                  <div className="small text-muted">
                                    {task.maintenanceType} • Priority:{" "}
                                    {task.priority}
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className={`badge bg-${
                                      task.priority === "HIGH" ||
                                      task.priority === "URGENT"
                                        ? "danger"
                                        : "warning"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                  {task.costEstimate && (
                                    <span className="badge bg-info">
                                      ${task.costEstimate}
                                    </span>
                                  )}
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-light">
                          <p className="mb-0">
                            {inspection.issues?.filter(
                              (i) => i.requiresMaintenance
                            ).length > 0
                              ? "No maintenance tasks have been created yet for issues that require maintenance."
                              : "No maintenance tasks were created from this inspection."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Create New Maintenance Task Button */}
                  {inspection.issues?.filter((i) => i.requiresMaintenance)
                    .length > 0 && (
                    <div className="mt-4">
                      <div className="alert alert-warning">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <AlertCircle size={20} className="me-2" />
                            <strong>Issues Requiring Maintenance:</strong> There
                            are{" "}
                            {
                              inspection.issues.filter(
                                (i) => i.requiresMaintenance
                              ).length
                            }{" "}
                            issues that require maintenance tasks.
                          </div>
                          <Link
                            href={`/admin/tasks/new?unitId=${inspection.task?.unitId}&buildingId=${inspection.task?.buildingId}&type=MAINTENANCE&parentTaskId=${inspection.taskId}`}
                            className="btn btn-warning"
                          >
                            <Wrench size={16} className="me-2" />
                            Create Maintenance Tasks
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes & Photos Tab */}
            {activeTab === "notes" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    {/* Notes */}
                    <div className="col-lg-8 mb-4">
                      <h5 className="mb-3">Inspection Notes</h5>
                      {inspection.notes ? (
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <p className="mb-0">{inspection.notes}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-light">
                          <p className="mb-0">
                            No additional notes provided for this inspection.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div className="col-lg-4 mb-4">
                      <h5 className="mb-3">Photos</h5>
                      {inspection.photos && inspection.photos.length > 0 ? (
                        <div className="row">
                          {inspection.photos.map((photo, index) => (
                            <div key={index} className="col-6 mb-3">
                              <div className="card border-0">
                                <img
                                  src={photo}
                                  alt={`Inspection photo ${index + 1}`}
                                  className="card-img-top rounded"
                                  style={{
                                    height: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="card-body p-2">
                                  <small className="text-muted d-block">
                                    Photo {index + 1}
                                  </small>
                                  <button
                                    className="btn btn-sm btn-link p-0 small"
                                    onClick={() => window.open(photo, "_blank")}
                                  >
                                    View Full Size
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-light">
                          <p className="mb-0">
                            No photos attached to this inspection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inspection Metadata */}
                  <div className="mt-4 pt-4 border-top">
                    <h6 className="text-muted mb-3">Inspection Metadata</h6>
                    <div className="row">
                      <div className="col-md-3 mb-2">
                        <div className="small text-muted">Inspection ID</div>
                        <div className="fw-semibold">{inspection.id}</div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div className="small text-muted">Created At</div>
                        <div className="fw-semibold">
                          {new Date(inspection.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div className="small text-muted">Task ID</div>
                        <div className="fw-semibold">{inspection.taskId}</div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div className="small text-muted">Inspector ID</div>
                        <div className="fw-semibold">
                          {inspection.inspectorId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
