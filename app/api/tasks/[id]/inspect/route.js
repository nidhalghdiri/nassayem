// Add to your existing app/api/tasks/route.js or create separate endpoints

// app/api/tasks/[id]/inspect/route.js
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

    // Update task with inspection results
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: data.status === "PASSED" ? "COMPLETED" : "MAINTENANCE_REQUIRED",
        completedAt: new Date(),
        notes: data.notes,
      },
      include: {
        unit: true,
        building: true,
      },
    });

    // Create inspection record
    const inspection = await prisma.inspection.create({
      data: {
        taskId: taskId,
        inspectorId: session.user.id,
        score: data.score,
        notes: data.notes,
        status: data.status,
        checklist: data.checklist,
        issues: data.issues,
      },
    });

    // Create maintenance tasks for issues requiring maintenance
    let maintenanceTaskId = null;
    if (data.issues && data.issues.some((issue) => issue.requiresMaintenance)) {
      const maintenanceTask = await prisma.task.create({
        data: {
          title: `Maintenance: ${updatedTask.unit.title}`,
          description: `Maintenance required based on inspection findings. Issues: ${data.issues
            .filter((i) => i.requiresMaintenance)
            .map((i) => i.description)
            .join(", ")}`,
          type: "MAINTENANCE",
          status: "PENDING",
          priority: "HIGH",
          unitId: updatedTask.unitId,
          buildingId: updatedTask.buildingId,
          createdById: session.user.id,
          parentTaskId: taskId,
          maintenanceType: "General",
        },
      });
      maintenanceTaskId = maintenanceTask.id;
    }

    // Notify relevant users
    if (updatedTask.assignedToId) {
      await prisma.notification.create({
        data: {
          type: "inspection_completed",
          title: "Inspection Completed",
          message: `Inspection for task "${updatedTask.title}" has been completed with score: ${data.score}%`,
          recipientId: updatedTask.assignedToId,
          taskId: taskId,
        },
      });
    }

    // Notify supervisor if failed
    if (data.status === "FAILED") {
      const supervisor = await prisma.user.findFirst({
        where: { role: "SUPERVISOR" },
      });

      if (supervisor) {
        await prisma.notification.create({
          data: {
            type: "inspection_failed",
            title: "Inspection Failed",
            message: `Inspection for ${updatedTask.unit.title} failed with score: ${data.score}%`,
            recipientId: supervisor.id,
            taskId: taskId,
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
      { error: "Failed to submit inspection" },
      { status: 500 }
    );
  }
}
