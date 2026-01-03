// app/api/inspections/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all inspections with filters
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
    const inspectorId = searchParams.get("inspectorId");
    const taskId = searchParams.get("taskId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (inspectorId && inspectorId !== "all") {
      where.inspectorId = inspectorId;
    }

    if (taskId && taskId !== "all") {
      where.taskId = taskId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = parseInt(minScore);
      if (maxScore) where.score.lte = parseInt(maxScore);
    }

    // Role-based filtering
    if (session.user.role === "RECEPTIONIST" && session.user.building?.id) {
      // Receptionists can only see inspections in their building
      where.task = {
        buildingId: session.user.building.id,
      };
    }

    if (session.user.role === "HOUSEKEEPING") {
      // Housekeeping staff can only see inspections of tasks assigned to them
      where.task = {
        assignedToId: session.user.id,
      };
    }

    // Get inspections with related data
    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.inspection.count({ where }),
    ]);

    // Get statistics
    const stats = await prisma.inspection.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
      _avg: {
        score: true,
      },
    });

    const statistics = {
      total,
      passed: 0,
      failed: 0,
      averageScore: 0,
    };

    stats.forEach((stat) => {
      if (stat.status === "PASSED") statistics.passed = stat._count._all;
      if (stat.status === "FAILED") statistics.failed = stat._count._all;
      if (stat._avg.score) {
        statistics.averageScore = Math.round(stat._avg.score);
      }
    });

    return NextResponse.json({
      inspections,
      statistics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}
