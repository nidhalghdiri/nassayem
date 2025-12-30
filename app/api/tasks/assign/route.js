// app/api/tasks/[id]/assign/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const data = await request.json();
    const { assignedToId } = data;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: true,
        building: true,
        unit: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to assign tasks" },
        { status: 403 }
      );
    }

    // If assigning to someone, verify they exist
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user is available (optional)
      if (user.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "User is not active" },
          { status: 400 }
        );
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: assignedToId || null,
        status: assignedToId ? "ASSIGNED" : "PENDING",
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            title: true,
            floor: true,
          },
        },
      },
    });

    // Create notification if assigned to someone
    if (assignedToId && task.assignedToId !== assignedToId) {
      await prisma.notification.create({
        data: {
          type: "task_assigned",
          title: "Task Assigned",
          message: `You have been assigned to: "${task.title}"`,
          recipientId: assignedToId,
          taskId: taskId,
        },
      });

      // Also notify the previous assignee if reassigned
      if (task.assignedToId && task.assignedToId !== assignedToId) {
        await prisma.notification.create({
          data: {
            type: "task_unassigned",
            title: "Task Unassigned",
            message: `Task "${task.title}" has been reassigned`,
            recipientId: task.assignedToId,
            taskId: taskId,
          },
        });
      }
    }

    // If unassigning, notify the previous assignee
    if (!assignedToId && task.assignedToId) {
      await prisma.notification.create({
        data: {
          type: "task_unassigned",
          title: "Task Unassigned",
          message: `You have been unassigned from: "${task.title}"`,
          recipientId: task.assignedToId,
          taskId: taskId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Task assignment updated",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json(
      { error: "Failed to assign task" },
      { status: 500 }
    );
  }
}
