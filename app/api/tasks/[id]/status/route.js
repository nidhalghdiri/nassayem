import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, escalationReason, actualMinutes } = await request.json();

    if (
      !status ||
      ![
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "ESCALATED",
      ].includes(status)
    ) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR"];
    const isAssignedUser = session.user.id === existingTask.assignedToId;
    const isCreator = session.user.id === existingTask.createdById;

    let hasPermission = false;

    // Admins, directors, supervisors can always change status
    if (allowedRoles.includes(session.user.role)) {
      hasPermission = true;
    }
    // Assigned user can change status to IN_PROGRESS or COMPLETED
    else if (isAssignedUser && ["IN_PROGRESS", "COMPLETED"].includes(status)) {
      hasPermission = true;
    }
    // Creator can cancel pending tasks
    else if (
      isCreator &&
      status === "CANCELLED" &&
      existingTask.status === "PENDING"
    ) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = { status };

    // Set timestamps based on status
    if (status === "IN_PROGRESS" && !existingTask.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === "COMPLETED" && !existingTask.completedAt) {
      updateData.completedAt = new Date();
    }

    if (actualMinutes) {
      updateData.actualMinutes = actualMinutes;
    }

    if (status === "ESCALATED" && escalationReason) {
      updateData.escalationReason = escalationReason;
      // For escalation, you might want to auto-assign to supervisor
      if (!updateData.escalatedToId) {
        // Find a supervisor in the same building
        const supervisor = await prisma.user.findFirst({
          where: {
            role: "SUPERVISOR",
            buildingId: existingTask.buildingId,
            isActive: true,
          },
          select: { id: true },
        });

        if (supervisor) {
          updateData.escalatedToId = supervisor.id;
        }
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notifications
    const notifications = [];

    // Notify assigned user if status changed by someone else
    if (
      existingTask.assignedToId &&
      existingTask.assignedToId !== session.user.id
    ) {
      notifications.push(
        prisma.notification.create({
          data: {
            type: `task_${status.toLowerCase()}`,
            title: `Task ${status.toLowerCase().replace("_", " ")}`,
            message: `Task "${
              existingTask.title
            }" has been marked as ${status.toLowerCase()}`,
            recipientId: existingTask.assignedToId,
            taskId: id,
          },
        })
      );
    }

    // Notify creator if task completed
    if (
      status === "COMPLETED" &&
      existingTask.createdById !== session.user.id
    ) {
      notifications.push(
        prisma.notification.create({
          data: {
            type: "task_completed",
            title: "Task Completed",
            message: `Task "${existingTask.title}" has been completed by ${session.user.name}`,
            recipientId: existingTask.createdById,
            taskId: id,
          },
        })
      );
    }

    // Notify escalated user
    if (status === "ESCALATED" && updateData.escalatedToId) {
      notifications.push(
        prisma.notification.create({
          data: {
            type: "task_escalated",
            title: "Task Escalated to You",
            message: `Task "${existingTask.title}" has been escalated with reason: ${escalationReason}`,
            recipientId: updateData.escalatedToId,
            taskId: id,
          },
        })
      );
    }

    if (notifications.length > 0) {
      await Promise.all(notifications);
    }

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
