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
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.id;
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inspectionId) {
      fetchInspection();
    }
  }, [inspectionId]);

  const fetchInspection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inspections/${inspectionId}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data.inspection);
      }
    } catch (error) {
      console.error("Error fetching inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
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
                  Inspection ID: {inspection.id}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={printReport}
                >
                  <Printer size={16} />
                  Print Report
                </button>
                <button className="btn btn-outline-primary d-flex align-items-center gap-2">
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

        <div className="row">
          <div className="col-lg-8">
            {/* Score Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6 text-center">
                    <div
                      className={`display-1 fw-bold ${
                        inspection.status === "PASSED"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {inspection.score}%
                    </div>
                    <div
                      className={`badge ${
                        inspection.status === "PASSED"
                          ? "bg-success"
                          : "bg-danger"
                      } fs-5`}
                    >
                      {inspection.status}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">INSPECTOR</h6>
                      <div className="d-flex align-items-center">
                        <User size={16} className="text-muted me-2" />
                        <div>
                          <p className="mb-0 fw-semibold">
                            {inspection.inspector.name}
                          </p>
                          <p className="mb-0 text-muted small">
                            {inspection.inspector.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">INSPECTION DATE</h6>
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="text-muted me-2" />
                        <div>
                          <p className="mb-0 fw-semibold">
                            {new Date(
                              inspection.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="mb-0 text-muted small">
                            {new Date(
                              inspection.createdAt
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Details */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FileText size={18} className="me-2" />
                  Checklist Details
                </h5>
              </div>
              <div className="card-body">
                {Array.isArray(inspection.checklist) &&
                inspection.checklist.length > 0 ? (
                  inspection.checklist.map((category, catIndex) => (
                    <div key={catIndex} className="mb-4">
                      <h6 className="border-bottom pb-2 mb-3">
                        {category.name}
                      </h6>
                      <div className="row">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="col-md-6 mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="fw-medium">{item.label}</span>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className={`badge ${
                                    item.score === item.maxScore
                                      ? "bg-success"
                                      : "bg-warning"
                                  }`}
                                >
                                  {item.score || 0}/{item.maxScore}
                                </span>
                                <span className="text-muted small">
                                  {Math.round(
                                    ((item.score || 0) / item.maxScore) * 100
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                            {item.notes && (
                              <div className="alert alert-light small mb-0">
                                <strong>Notes:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No checklist data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issues Found */}
            {inspection.issues && inspection.issues.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <AlertCircle size={18} className="me-2" />
                    Issues Found
                  </h5>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {inspection.issues.map((issue, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="me-3">
                            <div className="d-flex align-items-center mb-1">
                              <strong>Issue #{index + 1}</strong>
                              <span
                                className={`badge bg-${
                                  issue.priority === "HIGH"
                                    ? "danger"
                                    : issue.priority === "MEDIUM"
                                    ? "warning"
                                    : "info"
                                } ms-2`}
                              >
                                {issue.priority}
                              </span>
                              {issue.requiresMaintenance && (
                                <span className="badge bg-warning ms-2">
                                  Requires Maintenance
                                </span>
                              )}
                            </div>
                            <p className="mb-1">{issue.description}</p>
                            {issue.estimatedCost && (
                              <div className="small text-muted">
                                Estimated Cost: ${issue.estimatedCost}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {inspection.notes && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Inspection Notes</h5>
                </div>
                <div className="card-body">
                  <p className="mb-0">{inspection.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            {/* Task Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Task Information</h5>
              </div>
              <div className="card-body">
                {inspection.task ? (
                  <>
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">TASK</h6>
                      <p className="mb-1 fw-semibold">
                        {inspection.task.title}
                      </p>
                      <p className="mb-0 text-muted small">
                        Type: {inspection.task.type}
                      </p>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">UNIT</h6>
                      <div className="d-flex align-items-center mb-1">
                        <Home size={14} className="text-muted me-2" />
                        <span className="fw-semibold">
                          {inspection.task.unit?.title}
                        </span>
                      </div>
                      <p className="mb-0 text-muted small">
                        Floor {inspection.task.unit?.floor} •{" "}
                        {inspection.task.unit?.status}
                      </p>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted small mb-2">BUILDING</h6>
                      <div className="d-flex align-items-center mb-1">
                        <Building size={14} className="text-muted me-2" />
                        <span className="fw-semibold">
                          {inspection.task.building?.name}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Task information not available</p>
                )}
              </div>
            </div>

            {/* Photos */}
            {inspection.photos && inspection.photos.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Photos</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {inspection.photos.map((photo, index) => (
                      <div key={index} className="col-6 mb-3">
                        <div className="card">
                          <img
                            src={photo}
                            alt={`Inspection photo ${index + 1}`}
                            className="card-img-top"
                            style={{ height: "100px", objectFit: "cover" }}
                          />
                          <div className="card-body p-2">
                            <small className="text-muted">
                              Photo {index + 1}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Stats</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">CHECKLIST ITEMS</h6>
                  {Array.isArray(inspection.checklist) && (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Total Items</span>
                        <span>
                          {inspection.checklist.reduce(
                            (total, cat) => total + cat.items.length,
                            0
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Perfect Scores</span>
                        <span>
                          {inspection.checklist.reduce(
                            (total, cat) =>
                              total +
                              cat.items.filter(
                                (item) => item.score === item.maxScore
                              ).length,
                            0
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {inspection.issues && (
                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">ISSUES</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Total Issues</span>
                      <span>{inspection.issues.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Requiring Maintenance</span>
                      <span>
                        {
                          inspection.issues.filter(
                            (issue) => issue.requiresMaintenance
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
