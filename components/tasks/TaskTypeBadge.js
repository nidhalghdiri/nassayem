import React from "react";
import { Sparkles, Wrench, Eye, FileText } from "lucide-react";

const TaskTypeBadge = ({
  type,
  size = "md",
  showIcon = true,
  showText = true,
}) => {
  const typeConfig = {
    CLEANING: {
      text: "Cleaning",
      icon: Sparkles,
      color: "success",
      bgColor: "bg-success",
      textColor: "text-white",
    },
    MAINTENANCE: {
      text: "Maintenance",
      icon: Wrench,
      color: "warning",
      bgColor: "bg-warning",
      textColor: "text-dark",
    },
    INSPECTION: {
      text: "Inspection",
      icon: Eye,
      color: "info",
      bgColor: "bg-info",
      textColor: "text-white",
    },
    OTHER: {
      text: "Other",
      icon: FileText,
      color: "secondary",
      bgColor: "bg-secondary",
      textColor: "text-white",
    },
  };

  const config = typeConfig[type] || typeConfig.OTHER;
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

export default TaskTypeBadge;
