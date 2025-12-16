import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get task with related data
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            title: true,
            floor: true,
            status: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        escalatedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        taskNotes: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            photos: true,
            taskNotes: true,
            inspections: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    if (
      session.user.role === "HOUSEKEEPING" &&
      task.assignedToId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (
      session.user.role === "RECEPTIONIST" &&
      session.user.building.id !== task.buildingId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// Update the PATCH handler in your existing /api/tasks/[id]/route.js
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        buildingId: true,
        assignedToId: true,
        createdById: true,
        status: true,
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

    // Admins, directors, supervisors can edit any task
    if (allowedRoles.includes(session.user.role)) {
      hasPermission = true;
    }
    // Receptionists can edit tasks in their building
    else if (
      session.user.role === "RECEPTIONIST" &&
      session.user.building.id === existingTask.buildingId
    ) {
      hasPermission = true;
    }
    // Assigned user can edit certain fields
    else if (isAssignedUser) {
      // Assigned users can only edit certain fields
      const allowedFields = ["actualMinutes", "notes"];
      const restrictedFields = Object.keys(data).filter(
        (key) => !allowedFields.includes(key)
      );

      if (restrictedFields.length > 0) {
        return NextResponse.json(
          {
            error: `Assigned users can only update: ${allowedFields.join(
              ", "
            )}`,
          },
          { status: 403 }
        );
      }
      hasPermission = true;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Validate data
    const errors = {};

    if (data.title && data.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      errors.dueDate = "Due date cannot be in the past";
    }

    if (
      data.estimatedMinutes &&
      (data.estimatedMinutes < 1 || data.estimatedMinutes > 480)
    ) {
      errors.estimatedMinutes = "Estimated minutes must be between 1 and 480";
    }

    if (
      data.actualMinutes &&
      (data.actualMinutes < 1 || data.actualMinutes > 480)
    ) {
      errors.actualMinutes = "Actual minutes must be between 1 and 480";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Handle status changes
    const updateData = { ...data };

    if (
      data.status === "IN_PROGRESS" &&
      existingTask.status !== "IN_PROGRESS"
    ) {
      updateData.startedAt = new Date();
    }

    if (data.status === "COMPLETED" && existingTask.status !== "COMPLETED") {
      updateData.completedAt = new Date();
    }

    // Convert numeric fields
    if (data.estimatedMinutes !== undefined) {
      updateData.estimatedMinutes = data.estimatedMinutes
        ? parseInt(data.estimatedMinutes)
        : null;
    }

    if (data.actualMinutes !== undefined) {
      updateData.actualMinutes = data.actualMinutes
        ? parseInt(data.actualMinutes)
        : null;
    }

    if (data.costEstimate !== undefined) {
      updateData.costEstimate = data.costEstimate
        ? new Prisma.Decimal(data.costEstimate)
        : null;
    }

    if (data.actualCost !== undefined) {
      updateData.actualCost = data.actualCost
        ? new Prisma.Decimal(data.actualCost)
        : null;
    }

    // Handle empty strings
    if (data.description === "") updateData.description = null;
    if (data.notes === "") updateData.notes = null;
    if (data.escalationReason === "") updateData.escalationReason = null;
    if (data.maintenanceType === "") updateData.maintenanceType = null;

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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notifications for important changes
    const notifications = [];

    // Notify if assigned user changed
    if (data.assignedToId && data.assignedToId !== existingTask.assignedToId) {
      // Notify new assignee
      notifications.push(
        prisma.notification.create({
          data: {
            type: "task_assigned",
            title: "Task Assigned to You",
            message: `Task "${updatedTask.title}" has been assigned to you`,
            recipientId: data.assignedToId,
            taskId: id,
          },
        })
      );

      // Notify previous assignee if existed
      if (existingTask.assignedToId) {
        notifications.push(
          prisma.notification.create({
            data: {
              type: "task_unassigned",
              title: "Task Unassigned",
              message: `Task "${updatedTask.title}" has been reassigned`,
              recipientId: existingTask.assignedToId,
              taskId: id,
            },
          })
        );
      }
    }

    // Notify if due date changed (and task is not completed/cancelled)
    if (
      data.dueDate &&
      existingTask.status !== "COMPLETED" &&
      existingTask.status !== "CANCELLED"
    ) {
      const newDueDate = new Date(data.dueDate);
      const oldDueDate = existingTask.dueDate
        ? new Date(existingTask.dueDate)
        : null;

      if (!oldDueDate || newDueDate.getTime() !== oldDueDate.getTime()) {
        if (updatedTask.assignedToId) {
          notifications.push(
            prisma.notification.create({
              data: {
                type: "due_date_changed",
                title: "Task Due Date Changed",
                message: `Due date for task "${updatedTask.title}" has been updated`,
                recipientId: updatedTask.assignedToId,
                taskId: id,
              },
            })
          );
        }
      }
    }

    if (notifications.length > 0) {
      await Promise.all(notifications);
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);

    // Handle Prisma validation errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A task with similar details already exists" },
        { status: 400 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid reference (building, unit, or user not found)" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { id: true, buildingId: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions - only admins, directors, and supervisors can delete
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // For receptionists, check building access
    if (
      session.user.role === "RECEPTIONIST" &&
      session.user.building.id !== existingTask.buildingId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete task (this will cascade delete photos and notes due to Prisma relations)
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
