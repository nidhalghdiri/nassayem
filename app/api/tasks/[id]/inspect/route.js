import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Submit inspection
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const data = await request.json();

    // Check if task exists
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

    // Check permissions - only RECEPTIONIST, SUPERVISOR, ADMIN can inspect
    const allowedRoles = ["RECEPTIONIST", "SUPERVISOR", "ADMIN", "DIRECTOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to perform inspections" },
        { status: 403 }
      );
    }

    // Create inspection record
    const inspection = await prisma.inspection.create({
      data: {
        taskId: taskId,
        inspectorId: session.user.id,
        score: data.score,
        notes: data.notes,
        status: data.status, // PASSED or FAILED
        checklist: data.checklist,
        issues: data.issues || [],
        photos: data.photos || [],
      },
    });

    // Update task status based on inspection result
    let updatedTask;
    let maintenanceTaskId = null;

    if (data.status === "PASSED") {
      // Task passes inspection
      updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          notes: data.notes
            ? `${task.notes || ""}\n\nInspection Notes: ${data.notes}`.trim()
            : task.notes,
        },
      });
    } else {
      // Task fails inspection
      updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "MAINTENANCE_REQUIRED",
          notes: data.notes
            ? `${task.notes || ""}\n\nInspection Notes: ${data.notes}\nScore: ${
                data.score
              }%`.trim()
            : task.notes,
        },
      });

      // Create maintenance tasks for issues that require maintenance
      const maintenanceIssues =
        data.issues?.filter((issue) => issue.requiresMaintenance) || [];

      if (maintenanceIssues.length > 0) {
        for (const issue of maintenanceIssues) {
          const maintenanceTask = await prisma.task.create({
            data: {
              title: `Maintenance: ${issue.description.substring(0, 50)}...`,
              description: `Issue from inspection: ${
                issue.description
              }\n\nCategory: ${issue.category}\nPriority: ${
                issue.priority
              }\nEstimated Cost: ${issue.estimatedCost || "Not specified"}`,
              type: "MAINTENANCE",
              status: "PENDING",
              priority: issue.priority || "HIGH",
              unitId: task.unitId,
              buildingId: task.buildingId,
              createdById: session.user.id,
              parentTaskId: taskId,
              maintenanceType:
                issue.category === "safety" ? "Safety" : "General",
              costEstimate: issue.estimatedCost
                ? parseFloat(issue.estimatedCost)
                : null,
            },
          });
          maintenanceTaskId = maintenanceTask.id;
        }
      }
    }

    // Create notifications
    // Notify task assignee
    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          type: "inspection_completed",
          title: "Inspection Completed",
          message: `Inspection for task "${
            task.title
          }" has been ${data.status.toLowerCase()} with score: ${data.score}%`,
          recipientId: task.assignedToId,
          taskId: taskId,
          inspectionId: inspection.id,
        },
      });
    }

    // Notify supervisor if failed or score is low
    if (data.status === "FAILED" || data.score < 70) {
      const supervisor = await prisma.user.findFirst({
        where: { role: "SUPERVISOR" },
      });

      if (supervisor) {
        await prisma.notification.create({
          data: {
            type: "inspection_failed",
            title: `Inspection ${
              data.status === "FAILED" ? "Failed" : "Needs Attention"
            }`,
            message: `Inspection for ${task.unit.title} scored ${data.score}% and requires attention`,
            recipientId: supervisor.id,
            taskId: taskId,
            inspectionId: inspection.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Inspection submitted successfully",
      inspection,
      task: updatedTask,
      requiresMaintenance: maintenanceTaskId !== null,
      maintenanceTaskId,
    });
  } catch (error) {
    console.error("Error submitting inspection:", error);
    return NextResponse.json(
      { error: "Failed to submit inspection. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Get all inspections for a task
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;

    const inspections = await prisma.inspection.findMany({
      where: { taskId },
      include: {
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      inspections,
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}
