// app/api/tasks/workflow/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { taskId, action } = data;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        unit: true,
        building: true,
        assignedTo: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let followupTask = null;
    let message = "";

    switch (action) {
      case "create_inspection":
        // Create inspection task after cleaning completion
        if (task.type === "CLEANING" && task.status === "COMPLETED") {
          followupTask = await prisma.task.create({
            data: {
              title: `Inspection: ${task.unit.title}`,
              description: `Inspection required after cleaning task: ${task.title}`,
              type: "INSPECTION",
              status: "PENDING",
              priority: "MEDIUM",
              unitId: task.unitId,
              buildingId: task.buildingId,
              createdById: session.user.id,
              parentTaskId: taskId,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            },
          });
          message = "Inspection task created successfully";
        }
        break;

      case "create_maintenance":
        // Create maintenance task from inspection findings
        if (task.type === "INSPECTION") {
          followupTask = await prisma.task.create({
            data: {
              title: `Maintenance: ${task.unit.title}`,
              description: `Maintenance required based on inspection findings`,
              type: "MAINTENANCE",
              status: "PENDING",
              priority: "HIGH",
              unitId: task.unitId,
              buildingId: task.buildingId,
              createdById: session.user.id,
              parentTaskId: taskId,
              maintenanceType: data.maintenanceType || "Other",
              costEstimate: data.costEstimate,
            },
          });
          message = "Maintenance task created successfully";
        }
        break;

      case "escalate_to_supervisor":
        // Escalate task to supervisor
        const supervisor = await prisma.user.findFirst({
          where: { role: "SUPERVISOR" },
        });

        if (supervisor) {
          await prisma.task.update({
            where: { id: taskId },
            data: {
              escalatedToId: supervisor.id,
              status: "IN_PROGRESS",
              priority: "HIGH",
              escalationReason: data.reason,
            },
          });

          // Create notification for supervisor
          await prisma.notification.create({
            data: {
              type: "task_escalated",
              title: "Task Escalated",
              message: `Task "${task.title}" requires your attention`,
              recipientId: supervisor.id,
              taskId: taskId,
            },
          });

          message = "Task escalated to supervisor";
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message,
      followupTask,
    });
  } catch (error) {
    console.error("Workflow error:", error);
    return NextResponse.json(
      { error: "Workflow action failed" },
      { status: 500 }
    );
  }
}
