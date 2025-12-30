// components/dashboard/WorkflowDashboard.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

export default function WorkflowDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completedToday: 0,
    assignedToMe: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        fetch("/api/tasks/dashboard/stats"),
        fetch("/api/tasks?limit=5&sort=dueDate"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setRecentTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Stats Cards */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-start border-primary border-4 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-primary fw-bold">Pending Tasks</div>
                <div className="h3 mb-0">{stats.pending}</div>
              </div>
              <div className="bg-primary text-white rounded-circle p-3">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-start border-warning border-4 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-warning fw-bold">In Progress</div>
                <div className="h3 mb-0">{stats.inProgress}</div>
              </div>
              <div className="bg-warning text-white rounded-circle p-3">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-start border-danger border-4 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-danger fw-bold">Overdue</div>
                <div className="h3 mb-0">{stats.overdue}</div>
              </div>
              <div className="bg-danger text-white rounded-circle p-3">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-start border-success border-4 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-success fw-bold">Assigned to Me</div>
                <div className="h3 mb-0">{stats.assignedToMe}</div>
              </div>
              <div className="bg-success text-white rounded-circle p-3">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="col-12 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Tasks</h5>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => router.push("/admin/tasks")}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="d-flex flex-column">
                          <strong>{task.title}</strong>
                          <small className="text-muted">
                            {task.building?.name} • {task.unit?.title}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {task.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            task.priority === "HIGH"
                              ? "warning"
                              : task.priority === "URGENT"
                              ? "danger"
                              : "info"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            task.status === "COMPLETED"
                              ? "success"
                              : task.status === "IN_PROGRESS"
                              ? "primary"
                              : "warning"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => router.push(`/admin/tasks/${task.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentTasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">No recent tasks</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
