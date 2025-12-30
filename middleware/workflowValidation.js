// middleware/workflowValidation.js
import { WORKFLOW_RULES } from "@/config/workflowRules";

export function validateWorkflowTransition(
  userRole,
  taskType,
  currentStatus,
  newStatus
) {
  const rules = WORKFLOW_RULES[taskType];

  if (!rules) {
    return {
      valid: false,
      error: `No workflow rules defined for task type: ${taskType}`,
    };
  }

  // Check if transition is allowed
  const allowedTransitions = rules.allowedStatusTransitions[currentStatus];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Transition from ${currentStatus} to ${newStatus} is not allowed`,
    };
  }

  // Check role permissions
  const roleRules = WORKFLOW_RULES.rolePermissions[userRole];
  if (!roleRules) {
    return {
      valid: false,
      error: `User role ${userRole} not defined in permissions`,
    };
  }

  // Check if user can update status
  if (
    roleRules.canUpdateStatus !== true &&
    (!Array.isArray(roleRules.canUpdateStatus) ||
      !roleRules.canUpdateStatus.includes(newStatus))
  ) {
    return {
      valid: false,
      error: `User role ${userRole} cannot update status to ${newStatus}`,
    };
  }

  return { valid: true };
}

export function getNextValidStatuses(userRole, taskType, currentStatus) {
  const rules = WORKFLOW_RULES[taskType];
  if (!rules) return [];

  const allowedTransitions =
    rules.allowedStatusTransitions[currentStatus] || [];
  const roleRules = WORKFLOW_RULES.rolePermissions[userRole];

  if (!roleRules) return [];

  if (roleRules.canUpdateStatus === true) {
    return allowedTransitions;
  }

  if (Array.isArray(roleRules.canUpdateStatus)) {
    return allowedTransitions.filter((status) =>
      roleRules.canUpdateStatus.includes(status)
    );
  }

  return [];
}
