import React from "react";
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from "lucide-react";

const TaskPriorityBadge = ({
  priority,
  size = "md",
  showIcon = true,
  showText = true,
}) => {
  const priorityConfig = {
    LOW: {
      text: "Low",
      icon: ArrowDown,
      color: "success",
      bgColor: "bg-success",
      textColor: "text-white",
    },
    MEDIUM: {
      text: "Medium",
      icon: Minus,
      color: "info",
      bgColor: "bg-info",
      textColor: "text-white",
    },
    HIGH: {
      text: "High",
      icon: ArrowUp,
      color: "warning",
      bgColor: "bg-warning",
      textColor: "text-dark",
    },
    URGENT: {
      text: "Urgent",
      icon: AlertTriangle,
      color: "danger",
      bgColor: "bg-danger",
      textColor: "text-white",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
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

export default TaskPriorityBadge;
