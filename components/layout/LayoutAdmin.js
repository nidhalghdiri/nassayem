"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AdminSidebar from "./AdminSidebar";
import Link from "next/link";

export default function LayoutAdmin({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Close sidebar on larger screens
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check initial size
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Mobile header */}
      <header className="mobile-header d-lg-none">
        <div className="container-fluid h-100 px-3">
          <div className="d-flex align-items-center justify-content-between h-100">
            <div className="d-flex align-items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn btn-outline-secondary me-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px", padding: "6px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-list"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                  />
                </svg>
              </button>

              <div>
                <h5 className="mb-0 text-dark fw-bold">
                  Housekeeping Dashboard
                </h5>
              </div>
            </div>

            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: "32px", height: "32px" }}
                >
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <span className="d-none d-sm-inline">
                  {session?.user?.name?.split(" ")[0]}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item" onClick={() => signOut()}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for all screens - controlled by isMobile prop */}
      <AdminSidebar
        isMobile={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Desktop sidebar (always visible on large screens) */}
      <div className="d-none d-lg-block">
        <AdminSidebar isMobile={false} />
      </div>

      {/* Main content */}
      <main className="mainContent m-0">
        {/* Desktop Header */}
        <header className="d-none bg-white border-bottom shadow-sm py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0 text-dark fw-bold">Dashboard</h4>
              <small className="text-muted">
                Housekeeping Management System
              </small>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  style={{ width: "250px" }}
                />
                <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-search text-muted"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </div>
              </div>
              <button className="btn btn-outline-secondary position-relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-bell"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                </svg>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                  >
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                  <span className="d-none d-md-inline">
                    {session?.user?.name}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" href="/admin/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => signOut()}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
