import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all tasks for a specific unit
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unitId = params.id;
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Check if unit exists
    const unitExists = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true, buildingId: true },
    });

    if (!unitExists) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Role-based access check
    if (session.user.role === "RECEPTIONIST") {
      if (unitExists.buildingId !== session.user.building.id) {
        return NextResponse.json(
          { error: "Access denied to this unit's tasks" },
          { status: 403 }
        );
      }
    }

    // Build where clause
    const where = {
      unitId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (assignedToId && assignedToId !== "all") {
      where.assignedToId = assignedToId;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          priority: true,
          dueDate: true,
          startedAt: true,
          completedAt: true,
          estimatedMinutes: true,
          maintenanceType: true,
          costEstimate: true,
          escalationReason: true,
          createdAt: true,
          updatedAt: true,
          unit: {
            select: {
              id: true,
              title: true,
              floor: true,
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
              role: true,
            },
          },
          _count: {
            select: {
              photos: true,
              notes: true,
              notifications: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // Get task statistics for this unit
    const taskStats = await prisma.task.groupBy({
      by: ["status", "type"],
      where: { unitId },
      _count: {
        _all: true,
      },
    });

    // Format statistics
    const statistics = {
      total,
      byStatus: {},
      byType: {},
    };

    taskStats.forEach((stat) => {
      statistics.byStatus[stat.status] = statistics.byStatus[stat.status] || 0;
      statistics.byStatus[stat.status] += stat._count._all;

      statistics.byType[stat.type] = statistics.byType[stat.type] || 0;
      statistics.byType[stat.type] += stat._count._all;
    });

    return NextResponse.json({
      tasks,
      statistics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching unit tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit tasks" },
      { status: 500 }
    );
  }
}
