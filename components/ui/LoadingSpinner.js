import React from "react";

const LoadingSpinner = ({ size = "md", color = "primary", text = "" }) => {
  const sizeClasses = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
    info: "text-info",
    light: "text-light",
    dark: "text-dark",
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div
        className={`spinner-border ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2 text-muted small">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
