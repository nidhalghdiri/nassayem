"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Home,
  Users,
  Eye,
  Wrench,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  Calendar,
  BarChart,
  UserPlus,
  PlusCircle,
  UserCircle,
  Shield,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

const AdminSidebar = ({ isMobile, isOpen, onClose }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Navigation items grouped by category
  const navItems = [
    {
      section: "Dashboard",
      items: [
        {
          name: "Overview",
          href: "/admin",
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      section: "Tasks & Operations",
      items: [
        {
          name: "All Tasks",
          href: "/admin/tasks",
          icon: CheckSquare,
          badge: "12",
        },
        {
          name: "Create Task",
          href: "/admin/tasks/new",
          icon: PlusCircle,
          badge: null,
        },
        {
          name: "My Tasks",
          href: "/admin/tasks/my",
          icon: ClipboardCheck,
          badge: null,
        },
        {
          name: "Assign Task",
          href: "/admin/tasks/assign",
          icon: UserCircle,
          badge: null,
        },
      ],
    },
    {
      section: "Properties & Units",
      items: [
        {
          name: "Buildings",
          href: "/admin/buildings",
          icon: Building,
          badge: null,
        },
        {
          name: "Units",
          href: "/admin/units",
          icon: Home,
          badge: null,
        },
        {
          name: "Bookings",
          href: "/admin/bookings",
          icon: Calendar,
          badge: "3",
        },
        {
          name: "Inspections",
          href: "/admin/inspections",
          icon: Eye,
          badge: null,
        },
      ],
    },
    {
      section: "Team & Users",
      items: [
        {
          name: "All Users",
          href: "/admin/users",
          icon: Users,
          badge: null,
        },
        {
          name: "Add User",
          href: "/admin/users/new",
          icon: UserPlus,
          badge: null,
        },
        {
          name: "Roles & Permissions",
          href: "/admin/users/roles",
          icon: Shield,
          badge: null,
        },
      ],
    },
    {
      section: "Maintenance",
      items: [
        {
          name: "Maintenance Requests",
          href: "/admin/maintenance",
          icon: Wrench,
          badge: "5",
        },
        {
          name: "Housekeeping",
          href: "/admin/housekeeping",
          icon: Sparkles,
          badge: null,
        },
      ],
    },
    {
      section: "Reports & Analytics",
      items: [
        {
          name: "Analytics",
          href: "/admin/analytics",
          icon: BarChart,
          badge: null,
        },
        {
          name: "Reports",
          href: "/admin/reports",
          icon: FileText,
          badge: null,
        },
      ],
    },
  ];

  // User role colors
  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "bg-purple",
      DIRECTOR: "bg-danger",
      SUPERVISOR: "bg-warning",
      RECEPTIONIST: "bg-info",
      HOUSEKEEPING: "bg-success",
    };
    return colors[role] || "bg-secondary";
  };

  return (
    <>
      {/* Mobile overlay - Fixed position */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay active" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebarContainer ${isOpen ? "translate-x-0" : ""} ${
          !isMobile ? "d-none" : " d-lg-block"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <Link
              href="/dashboard"
              className="d-flex align-items-center gap-3 text-decoration-none"
              onClick={() => isMobile && onClose()}
            >
              <div
                className="rounded bg-primary d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <Building className="text-white" size={20} />
              </div>
              <div>
                <h1 className="fw-bold mb-0 text-dark fs-6">Housekeeping</h1>
                <p className="text-muted mb-0 small">Management System</p>
              </div>
            </Link>

            {isMobile && (
              <button
                onClick={onClose}
                className="btn btn-sm btn-outline-secondary rounded-circle"
                style={{ width: "32px", height: "32px", padding: "6px" }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: "48px",
                  height: "48px",
                  background:
                    "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
                }}
              >
                {session?.user?.name?.charAt(0) || "A"}
              </div>
              <div
                className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${getRoleColor(
                  session?.user?.role
                )}`}
                style={{ width: "12px", height: "12px" }}
              />
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <h3 className="fw-semibold text-dark mb-0 text-truncate">
                {session?.user?.name || "Admin User"}
              </h3>
              <p className="text-muted mb-0 small text-truncate">
                {session?.user?.role?.toLowerCase().replace(/_/g, " ") ||
                  "Administrator"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebarNav py-4 px-3">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-5 last-mb-0">
              <h3 className="text-uppercase text-muted mb-3 px-3 small fw-semibold">
                {section.section}
              </h3>

              <ul className="list-unstyled mb-0">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name} className="mb-1">
                      <Link
                        href={item.href}
                        onClick={() => isMobile && onClose()}
                        className={`d-flex align-items-center justify-content-between gap-3 px-3 py-2 rounded text-decoration-none
                          ${
                            isActive
                              ? "bg-primary bg-opacity-10 text-primary border-start border-3 border-primary"
                              : "text-dark hover-bg-light"
                          }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <Icon
                            className={`${
                              isActive ? "text-primary" : "text-muted"
                            }`}
                            size={18}
                          />
                          <span className="fw-medium">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`badge rounded-pill ${
                              isActive ? "bg-primary" : "bg-light text-dark"
                            }`}
                            style={{ minWidth: "24px" }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-top">
          <div className="d-flex flex-column gap-3">
            <Link
              href="/admin/notifications"
              className="d-flex align-items-center gap-3 p-3 rounded text-decoration-none text-dark hover-bg-light"
              onClick={() => isMobile && onClose()}
            >
              <Bell className="text-muted" size={18} />
              <span className="fw-medium">Notifications</span>
              <span className="ms-auto badge bg-danger rounded-pill">3</span>
            </Link>

            <Link
              href="/admin/settings"
              className="d-flex align-items-center gap-3 p-3 rounded text-decoration-none text-dark hover-bg-light"
              onClick={() => isMobile && onClose()}
            >
              <Settings className="text-muted" size={18} />
              <span className="fw-medium">Settings</span>
            </Link>

            <button
              onClick={() => {
                signOut({ callbackUrl: "/en/login" });
                if (isMobile) onClose();
              }}
              className="d-flex align-items-center gap-3 p-3 rounded border-0 bg-transparent text-danger w-100 text-start hover-bg-light"
            >
              <LogOut className="text-danger" size={18} />
              <span className="fw-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
