import React from "react";
import {
  CheckCircle,
  Users,
  Wrench,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const UnitStatusBadge = ({
  status,
  showIcon = true,
  showText = true,
  size = "md",
}) => {
  // Define status configurations
  const statusConfig = {
    AVAILABLE: {
      text: "Available",
      icon: CheckCircle,
      color: "success",
      bgColor: "bg-success",
      textColor: "text-white",
    },
    RENTED: {
      text: "Rented",
      icon: Users,
      color: "info",
      bgColor: "bg-info",
      textColor: "text-white",
    },
    MAINTENANCE: {
      text: "Maintenance",
      icon: Wrench,
      color: "warning",
      bgColor: "bg-warning",
      textColor: "text-dark",
    },
    UNAVAILABLE: {
      text: "Unavailable",
      icon: XCircle,
      color: "secondary",
      bgColor: "bg-secondary",
      textColor: "text-white",
    },
    PENDING: {
      text: "Pending",
      icon: Clock,
      color: "warning",
      bgColor: "bg-warning",
      textColor: "text-dark",
    },
    NEEDS_ATTENTION: {
      text: "Needs Attention",
      icon: AlertCircle,
      color: "danger",
      bgColor: "bg-danger",
      textColor: "text-white",
    },
  };

  // Get the configuration for the current status, default to AVAILABLE
  const config = statusConfig[status] || statusConfig.AVAILABLE;
  const IconComponent = config.icon;

  // Size classes
  const sizeClasses = {
    sm: {
      badge: "px-2 py-1 text-xs",
      icon: "h-3 w-3",
    },
    md: {
      badge: "px-3 py-1.5 text-sm",
      icon: "h-4 w-4",
    },
    lg: {
      badge: "px-4 py-2 text-base",
      icon: "h-5 w-5",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`badge ${config.bgColor} ${config.textColor} ${currentSize.badge} d-inline-flex align-items-center gap-1`}
      title={config.text}
    >
      {showIcon && <IconComponent className={currentSize.icon} />}
      {showText && <span>{config.text}</span>}
    </span>
  );
};

export default UnitStatusBadge;
