// app/api/inspections/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
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
              },
            },
          },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role === "RECEPTIONIST" && session.user.building?.id) {
      if (inspection.task.buildingId !== session.user.building.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    if (session.user.role === "HOUSEKEEPING") {
      // Housekeeping can only view inspections of their tasks
      const task = await prisma.task.findUnique({
        where: { id: inspection.taskId },
        select: { assignedToId: true },
      });

      if (task.assignedToId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      inspection,
    });
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection" },
      { status: 500 }
    );
  }
}
