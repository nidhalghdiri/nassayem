// config/workflowRules.js
export const WORKFLOW_RULES = {
  CLEANING: {
    onComplete: {
      autoCreateInspection: true,
      requiredRoles: ["RECEPTIONIST"],
      deadline: 24, // hours
      priority: "MEDIUM",
    },
    allowedStatusTransitions: {
      PENDING: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
      ASSIGNED: ["IN_PROGRESS", "PENDING", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "ON_HOLD", "CANCELLED"],
      COMPLETED: ["INSPECTION_REQUIRED", "CLOSED"],
      INSPECTION_REQUIRED: ["CLOSED", "MAINTENANCE_REQUIRED"],
    },
  },

  MAINTENANCE: {
    onComplete: {
      autoCreateInspection: false,
      requiresSupervisorApproval: true,
      costThreshold: 500, // USD
    },
    allowedStatusTransitions: {
      PENDING: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
      ASSIGNED: ["IN_PROGRESS", "PENDING", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "ON_HOLD", "ESCALATED", "CANCELLED"],
      COMPLETED: ["INSPECTION_REQUIRED", "CLOSED"],
      ESCALATED: ["IN_PROGRESS", "CANCELLED"],
    },
  },

  INSPECTION: {
    scoring: {
      passThreshold: 80,
      failAction: "CREATE_MAINTENANCE",
      partialPassAction: "CREATE_FOLLOWUP",
    },
    allowedStatusTransitions: {
      PENDING: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: ["CLOSED"],
    },
  },

  rolePermissions: {
    HOUSEKEEPING: {
      canCreate: false,
      canAssign: false,
      canComplete: ["CLEANING"],
      canUpdateStatus: ["IN_PROGRESS", "COMPLETED"],
    },
    RECEPTIONIST: {
      canCreate: true,
      canAssign: true,
      canComplete: ["INSPECTION"],
      canUpdateStatus: ["IN_PROGRESS", "COMPLETED", "MAINTENANCE_REQUIRED"],
    },
    SUPERVISOR: {
      canCreate: true,
      canAssign: true,
      canComplete: true,
      canUpdateStatus: true,
      canEscalate: true,
      canApproveCosts: true,
    },
    ADMIN: {
      canCreate: true,
      canAssign: true,
      canComplete: true,
      canUpdateStatus: true,
      canEscalate: true,
      canApproveCosts: true,
      canOverride: true,
    },
  },
};

export const INSPECTION_CATEGORIES = [
  {
    id: "cleaning_quality",
    name: "Cleaning Quality",
    weight: 40,
    items: [
      { id: "floor_clean", label: "Floors clean and mopped", maxScore: 10 },
      { id: "surfaces_dusted", label: "All surfaces dusted", maxScore: 10 },
      { id: "windows_clean", label: "Windows and mirrors clean", maxScore: 10 },
      {
        id: "trash_removed",
        label: "Trash removed and bins clean",
        maxScore: 10,
      },
    ],
  },
  {
    id: "maintenance_check",
    name: "Maintenance Check",
    weight: 30,
    items: [
      { id: "plumbing_working", label: "All plumbing working", maxScore: 15 },
      {
        id: "electrical_working",
        label: "All electrical working",
        maxScore: 15,
      },
    ],
  },
  {
    id: "safety_compliance",
    name: "Safety Compliance",
    weight: 30,
    items: [
      {
        id: "smoke_detectors",
        label: "Smoke detectors functional",
        maxScore: 10,
      },
      { id: "emergency_exits", label: "Emergency exits clear", maxScore: 10 },
      {
        id: "fire_extinguisher",
        label: "Fire extinguisher present",
        maxScore: 10,
      },
    ],
  },
];
