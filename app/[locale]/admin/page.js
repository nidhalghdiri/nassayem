"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LayoutAdmin from "../../../components/layout/LayoutAdmin";
import {
  Clock,
  CheckSquare,
  Wrench,
  Sparkles,
  Filter,
  ChevronRight,
  CheckCircle,
  Activity,
  UserCheck,
  Building,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Eye,
  Users,
  FileText,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    maintenanceRequests: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingInspections, setUpcomingInspections] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Update time and greeting
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalTasks: 42,
        pendingTasks: 12,
        completedTasks: 28,
        maintenanceRequests: 5,
      });

      setRecentTasks([
        {
          id: 1,
          unit: "101-A",
          type: "Cleaning",
          assignedTo: "John Doe",
          status: "completed",
          priority: "medium",
          dueDate: "Today",
        },
        {
          id: 2,
          unit: "205-B",
          type: "Maintenance",
          assignedTo: "Mike Smith",
          status: "in-progress",
          priority: "high",
          dueDate: "Today",
        },
        {
          id: 3,
          unit: "302-C",
          type: "Inspection",
          assignedTo: "Sarah Lee",
          status: "pending",
          priority: "medium",
          dueDate: "Tomorrow",
        },
        {
          id: 4,
          unit: "110-D",
          type: "Cleaning",
          assignedTo: "Alex Johnson",
          status: "pending",
          priority: "low",
          dueDate: "Today",
        },
      ]);

      setUpcomingInspections([
        {
          id: 1,
          unit: "101-A",
          inspector: "Sarah Lee",
          time: "10:00 AM",
          status: "scheduled",
        },
        {
          id: 2,
          unit: "205-B",
          inspector: "John Doe",
          time: "11:30 AM",
          status: "scheduled",
        },
        {
          id: 3,
          unit: "302-C",
          inspector: "Mike Smith",
          time: "2:00 PM",
          status: "pending",
        },
      ]);

      setActivityFeed([
        {
          id: 1,
          action: "Task completed",
          user: "John Doe",
          unit: "101-A",
          time: "5 min ago",
        },
        {
          id: 2,
          action: "Maintenance request created",
          user: "Sarah Lee",
          unit: "205-B",
          time: "15 min ago",
        },
        {
          id: 3,
          action: "New task assigned",
          user: "Mike Smith",
          unit: "302-C",
          time: "30 min ago",
        },
        {
          id: 4,
          action: "Inspection passed",
          user: "Alex Johnson",
          unit: "110-D",
          time: "1 hour ago",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Quick actions for admin
  const quickActions = [
    {
      id: 1,
      title: "Add Task",
      icon: PlusCircle,
      color: "primary",
      link: "/admin/tasks/new",
      description: "Create new cleaning/maintenance task",
    },
    {
      id: 2,
      title: "Assign Task",
      icon: UserCheck,
      color: "success",
      link: "/admin/tasks/assign",
      description: "Assign task to team member",
    },
    {
      id: 3,
      title: "Unit Check",
      icon: Eye,
      color: "info",
      link: "/admin/inspections/new",
      description: "Perform unit inspection",
    },
    {
      id: 4,
      title: "Add User",
      icon: Users,
      color: "warning",
      link: "/admin/users/new",
      description: "Register new team member",
    },
    {
      id: 5,
      title: "Reports",
      icon: FileText,
      color: "secondary",
      link: "/admin/analytics",
      description: "View performance reports",
    },
    {
      id: 6,
      title: "Send Notification",
      icon: Bell,
      color: "danger",
      link: "/admin/notifications",
      description: "Send alert to team",
    },
  ];

  // Status badge colors
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-success-light",
        text: "text-success",
        icon: CheckCircle,
      },
      "in-progress": { bg: "bg-info-light", text: "text-info", icon: Activity },
      pending: { bg: "bg-warning-light", text: "text-warning", icon: Clock },
      scheduled: { bg: "bg-primary-light", text: "text-primary", icon: Clock },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  // Priority badge colors
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: "bg-danger-light", text: "text-danger", label: "High" },
      medium: { bg: "bg-warning-light", text: "text-warning", label: "Medium" },
      low: { bg: "bg-success-light", text: "text-success", label: "Low" },
      urgent: { bg: "bg-danger", text: "text-white", label: "Urgent" },
    };
    return priorityConfig[priority] || priorityConfig.medium;
  };

  return (
    <LayoutAdmin>
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h1 className="h3 mb-2 text-dark">
                {greeting}, {session?.user?.name || "Admin"}!
              </h1>
              <p className="text-muted mb-0">
                <Clock size={16} className="me-2" />
                {currentDate}
              </p>
            </div>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={fetchDashboardData}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2">
                <PlusCircle size={16} />
                Quick Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">
                      Total Tasks
                    </h6>
                    <h2 className="mb-0">{stats.totalTasks}</h2>
                    <div className="mt-2">
                      <span className="text-success small">
                        <TrendingUp size={14} className="me-1" />
                        +12% from yesterday
                      </span>
                    </div>
                  </div>
                  <div className="stat-icon bg-primary-light">
                    <CheckSquare size={24} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">
                      Pending Tasks
                    </h6>
                    <h2 className="mb-0 text-warning">{stats.pendingTasks}</h2>
                    <div className="mt-2">
                      <span className="text-muted small">
                        {stats.completedTasks} completed today
                      </span>
                    </div>
                  </div>
                  <div className="stat-icon bg-warning-light">
                    <Clock size={24} className="text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">
                      Maintenance
                    </h6>
                    <h2 className="mb-0 text-danger">
                      {stats.maintenanceRequests}
                    </h2>
                    <div className="mt-2">
                      <span className="text-muted small">Active requests</span>
                    </div>
                  </div>
                  <div className="stat-icon bg-danger-light">
                    <Wrench size={24} className="text-danger" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stat-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">
                      Urgent Tasks
                    </h6>
                    <h2 className="mb-0 text-danger">3</h2>
                    <div className="mt-2">
                      <span className="text-muted small">Need attention</span>
                    </div>
                  </div>
                  <div className="stat-icon bg-danger-light">
                    <Bell size={24} className="text-danger" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="row">
          {/* Left Column - Recent Tasks & Quick Actions */}
          <div className="col-lg-8">
            {/* Recent Tasks */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <CheckSquare size={20} className="me-2" />
                  Recent Tasks
                </h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary">
                    <Filter size={14} />
                  </button>
                  <Link href="/admin/tasks" className="btn btn-sm btn-primary">
                    View All <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Unit</th>
                        <th>Type</th>
                        <th>Assigned To</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => {
                        const status = getStatusBadge(task.status);
                        const priority = getPriorityBadge(task.priority);
                        const StatusIcon = status.icon;

                        return (
                          <tr key={task.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <Building
                                  size={16}
                                  className="me-2 text-muted"
                                />
                                <strong>{task.unit}</strong>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  task.type === "Cleaning"
                                    ? "bg-info"
                                    : "bg-warning"
                                }`}
                              >
                                {task.type}
                              </span>
                            </td>
                            <td>{task.assignedTo}</td>
                            <td>
                              <span
                                className={`badge ${priority.bg} ${priority.text}`}
                              >
                                {priority.label}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <StatusIcon size={16} className={status.text} />
                                <span className={status.text}>
                                  {task.status.replace("-", " ")}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={
                                  task.dueDate === "Today"
                                    ? "text-danger fw-bold"
                                    : ""
                                }
                              >
                                {task.dueDate}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary">
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 d-flex align-items-center">
                  <Sparkles size={20} className="me-2" />
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <div key={action.id} className="col-md-4 col-sm-6">
                        <Link
                          href={action.link}
                          className={`quick-action-card card h-100 text-decoration-none border border-${action.color} border-2`}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              className={`icon-wrapper bg-${action.color}-light`}
                            >
                              <Icon
                                size={24}
                                className={`text-${action.color}`}
                              />
                            </div>
                            <h6 className="card-title mb-2">{action.title}</h6>
                            <p className="card-text text-muted small">
                              {action.description}
                            </p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Inspections */}
          <div className="col-lg-4">
            {/* Activity Feed */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0 d-flex align-items-center">
                  <Activity size={20} className="me-2" />
                  Recent Activity
                </h5>
              </div>
              <div className="card-body">
                <div className="activity-feed">
                  {activityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className="activity-item d-flex mb-3 pb-3 border-bottom"
                    >
                      <div className="flex-shrink-0">
                        <div className="activity-avatar bg-primary-light rounded-circle d-flex align-items-center justify-content-center">
                          <UserCheck size={16} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between">
                          <h6 className="mb-1 small fw-bold">
                            {activity.action}
                          </h6>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <p className="mb-1 small">
                          <span className="text-muted">by</span> {activity.user}
                        </p>
                        <p className="mb-0 small">
                          <span className="text-muted">Unit:</span>{" "}
                          {activity.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-outline-secondary w-100 mt-3">
                  Load More Activity
                </button>
              </div>
            </div>

            {/* Upcoming Inspections */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <Eye size={20} className="me-2" />
                  Upcoming Inspections
                </h5>
                <span className="badge bg-primary">
                  {upcomingInspections.length}
                </span>
              </div>
              <div className="card-body">
                <div className="inspection-list">
                  {upcomingInspections.map((inspection) => {
                    const status = getStatusBadge(inspection.status);
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={inspection.id}
                        className="inspection-item d-flex align-items-center mb-3 pb-3 border-bottom"
                      >
                        <div className="flex-shrink-0">
                          <div className="inspection-time bg-primary text-white rounded text-center p-2">
                            <div className="time-hour">
                              {inspection.time.split(" ")[0]}
                            </div>
                            <div className="time-period small">
                              {inspection.time.split(" ")[1]}
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 small fw-bold">
                            Unit {inspection.unit}
                          </h6>
                          <p className="mb-1 small text-muted">
                            Inspector: {inspection.inspector}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusIcon size={16} className={status.text} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/admin/inspections"
                  className="btn btn-outline-primary w-100 mt-3"
                >
                  View All Inspections
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
