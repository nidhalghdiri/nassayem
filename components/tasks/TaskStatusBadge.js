import React from "react";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const TaskStatusBadge = ({
  status,
  size = "md",
  showIcon = true,
  showText = true,
}) => {
  const statusConfig = {
    PENDING: {
      text: "Pending",
      icon: Clock,
      color: "secondary",
      bgColor: "bg-secondary",
      textColor: "text-white",
    },
    IN_PROGRESS: {
      text: "In Progress",
      icon: PlayCircle,
      color: "info",
      bgColor: "bg-info",
      textColor: "text-white",
    },
    COMPLETED: {
      text: "Completed",
      icon: CheckCircle,
      color: "success",
      bgColor: "bg-success",
      textColor: "text-white",
    },
    CANCELLED: {
      text: "Cancelled",
      icon: XCircle,
      color: "danger",
      bgColor: "bg-danger",
      textColor: "text-white",
    },
    ESCALATED: {
      text: "Escalated",
      icon: AlertCircle,
      color: "warning",
      bgColor: "bg-warning",
      textColor: "text-dark",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const IconComponent = config.icon;

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

export default TaskStatusBadge;
