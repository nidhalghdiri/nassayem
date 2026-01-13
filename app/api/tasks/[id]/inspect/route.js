// app/api/tasks/[id]/inspect/route.js
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
    const userRole = session.user.role;

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

    // Validate the inspector exists
    const inspector = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!inspector) {
      return NextResponse.json(
        { error: "Inspector not found" },
        { status: 404 }
      );
    }

    // Create inspection record with proper data structure
    const inspectionData = {
      taskId: taskId,
      inspectorId: session.user.id,
      inspectorRole: userRole,
      score: data.score,
      notes: data.notes || null,
      status: data.status || "FAILED", // PASSED or FAILED
      checklist: data.checklist || [],
      issues: data.issues || [],
      photos: data.photos || [],
    };

    console.log(
      "Creating inspection with data:",
      JSON.stringify(inspectionData, null, 2)
    );

    try {
      const result = await prisma.$transaction(async (tx) => {
        const inspection = await prisma.inspection.create({
          data: inspectionData,
        });

        let taskUpdateData = {};
        let unitUpdateData = {};
        if (data.status === "PASSED") {
          // Set approval flags based on role
          const isSup =
            userRole === "SUPERVISOR" ||
            userRole === "ADMIN" ||
            userRole === "DIRECTOR";
          const isRec = userRole === "RECEPTIONIST";
          // Logic for Dual Approval
          const updatedSupApproved = isSup ? true : task.isSupervisorApproved;
          const updatedRecApproved = isRec ? true : task.isReceptionistApproved;

          taskUpdateData = {
            isSupervisorApproved: updatedSupApproved,
            isReceptionistApproved: updatedRecApproved,
          };
          if (updatedSupApproved && updatedRecApproved) {
            // BOTH PASSED
            taskUpdateData.status = "COMPLETED";
            taskUpdateData.completedAt = new Date();
            unitUpdateData.status = "AVAILABLE";
          } else {
            // ONLY ONE PASSED
            taskUpdateData.status = "PARTIALLY_INSPECTED";
            unitUpdateData.status = "INSPECTING";
          }
        } else if (data.status === "FAILED") {
          // 1. Mark the parent task as "MAINTENANCE_REQUIRED"
          // but DON'T necessarily block the unit if the issue is minor.

          const spawnedTasks = await Promise.all(
            data.issues.map((issue) =>
              tx.task.create({
                data: {
                  title: `${issue.category}: ${issue.description.substring(
                    0,
                    30
                  )}`,
                  type: issue.requiresMaintenance ? "MAINTENANCE" : "CLEANING",
                  status: "PENDING",
                  priority: issue.priority || "MEDIUM",
                  unitId: task.unitId,
                  buildingId: task.buildingId,
                  parentTaskId: taskId, // Linking to original cleaning task
                  createdById: session.user.id,
                  description: `Source: Inspection of ${task.title}. \nIssue: ${issue.description}`,
                },
              })
            )
          );
        } else {
          // INSPECTION FAILED
          taskUpdateData = {
            status: "MAINTENANCE_REQUIRED",
            isSupervisorApproved: false, // Reset approvals on failure
            isReceptionistApproved: false,
          };
          unitUpdateData.status = "MAINTENANCE";

          const maintenanceIssues =
            data.issues?.filter((issue) => issue.requiresMaintenance) || [];

          if (maintenanceIssues.length > 0) {
            for (const issue of maintenanceIssues) {
              const maintenanceTask = await prisma.task.create({
                data: {
                  title: `Maintenance: ${issue.description.substring(
                    0,
                    50
                  )}...`,
                  description: `Issue from inspection: ${
                    issue.description
                  }\n\nCategory: ${issue.category || "general"}\nPriority: ${
                    issue.priority || "HIGH"
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
            }
          }
        }

        // 5. Apply Updates
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: taskUpdateData,
        });

        await tx.unit.update({
          where: { id: task.unitId },
          data: unitUpdateData,
        });

        return { inspection, updatedTask };
      });

      return NextResponse.json({ success: true, ...result });
    } catch (prismaError) {
      console.error("Prisma error creating inspection:", prismaError);
      return NextResponse.json(
        { error: "Failed to submit inspection" },
        { status: 500 }
      );
    }
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
