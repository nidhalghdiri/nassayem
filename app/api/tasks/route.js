import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all tasks with filters and pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const createdById = searchParams.get("createdById");
    const unitId = searchParams.get("unitId");
    const buildingId = searchParams.get("buildingId");
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const overdue = searchParams.get("overdue");

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      OR: search
        ? [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ]
        : undefined,
    };
    if (!search) delete where.OR;

    console.log("Session User", session.user);
    // Role-based filtering
    if (session.user.role === "HOUSEKEEPING") {
      where.OR = [
        { assignedToId: session.user.id },
        // Add other conditions if needed
      ];
    } else if (session.user.role === "RECEPTIONIST") {
      if (session.user.building.id) {
        where.buildingId = session.user.building.id;
      } else {
        return NextResponse.json(
          { error: "Receptionist must be assigned to a building" },
          { status: 403 }
        );
      }
    }

    // Apply filters
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

    if (createdById && createdById !== "all") {
      where.createdById = createdById;
    }

    if (unitId && unitId !== "all") {
      where.unitId = unitId;
    }

    if (buildingId && buildingId !== "all") {
      where.buildingId = buildingId;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    if (overdue === "true") {
      where.status = { in: ["PENDING", "IN_PROGRESS"] };
      where.dueDate = { lt: new Date() };
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
          actualMinutes: true,
          maintenanceType: true,
          costEstimate: true,
          actualCost: true,
          escalationReason: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
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
          _count: {
            select: {
              photos: true,
              taskNotes: true,
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

    // Get statistics
    const stats = await prisma.task.groupBy({
      by: ["status", "type"],
      _count: {
        _all: true,
      },
    });

    // Get overdue count
    const overdueCount = await prisma.task.count({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: new Date() },
      },
    });

    // Format statistics
    const statistics = {
      total,
      overdue: overdueCount,
      byStatus: {},
      byType: {},
    };

    stats.forEach((stat) => {
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
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions based on role
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to create tasks" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const errors = {};

    if (!data.title || data.title.trim().length < 3) {
      errors.title = "Title is required and must be at least 3 characters";
    }

    if (
      !data.type ||
      !["CLEANING", "MAINTENANCE", "INSPECTION", "OTHER"].includes(data.type)
    ) {
      errors.type = "Valid task type is required";
    }

    if (!data.unitId) {
      errors.unitId = "Unit selection is required";
    }

    if (!data.buildingId) {
      errors.buildingId = "Building selection is required";
    }

    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      errors.dueDate = "Due date cannot be in the past";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Check if unit exists
    const unitExists = await prisma.unit.findUnique({
      where: { id: data.unitId },
      select: { id: true, buildingId: true },
    });

    if (!unitExists) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if building exists
    const buildingExists = await prisma.building.findUnique({
      where: { id: data.buildingId },
    });

    if (!buildingExists) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    // For receptionists, check if they can assign tasks to this unit
    if (session.user.role === "RECEPTIONIST") {
      if (unitExists.buildingId !== session.user.building.id) {
        return NextResponse.json(
          {
            error:
              "You can only create tasks for units in your assigned building",
          },
          { status: 403 }
        );
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim(),
        type: data.type,
        status: data.status || "PENDING",
        priority: data.priority || "MEDIUM",
        unitId: data.unitId,
        buildingId: data.buildingId,
        createdById: session.user.id,
        assignedToId: data.assignedToId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedMinutes: data.estimatedMinutes || null,
        maintenanceType: data.maintenanceType || null,
        costEstimate: data.costEstimate ? data.costEstimate : null, // FIXED
        actualCost: data.actualCost ? data.actualCost : null, // FIXED
        notes: data.notes || null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        priority: true,
        dueDate: true,
        estimatedMinutes: true,
        maintenanceType: true,
        costEstimate: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            title: true,
            floor: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for assigned user if applicable
    if (task.assignedTo) {
      await prisma.notification.create({
        data: {
          type: "task_assigned",
          title: `New ${task.type.toLowerCase()} task assigned`,
          message: `You have been assigned to: ${task.title}`,
          recipientId: task.assignedTo.id,
          taskId: task.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task. Please try again." },
      { status: 500 }
    );
  }
}
