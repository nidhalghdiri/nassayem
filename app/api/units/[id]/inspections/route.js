import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all inspections for a specific unit
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
    const inspectorId = searchParams.get("inspectorId");
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
          { error: "Access denied to this unit's inspections" },
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

    if (inspectorId && inspectorId !== "all") {
      where.inspectorId = inspectorId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get inspections with pagination
    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        select: {
          id: true,
          status: true,
          score: true,
          notes: true,
          createdAt: true,
          unit: {
            select: {
              id: true,
              title: true,
              floor: true,
            },
          },
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
        skip,
        take: limit,
      }),
      prisma.inspection.count({ where }),
    ]);

    // Get inspection statistics for this unit
    const inspectionStats = await prisma.inspection.groupBy({
      by: ["status"],
      where: { unitId },
      _count: {
        _all: true,
      },
      _avg: {
        score: true,
      },
    });

    // Format statistics
    const statistics = {
      total,
      byStatus: {},
      averageScore: inspectionStats[0]?._avg?.score || 0,
    };

    inspectionStats.forEach((stat) => {
      statistics.byStatus[stat.status] = statistics.byStatus[stat.status] || 0;
      statistics.byStatus[stat.status] += stat._count._all;
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
    console.error("Error fetching unit inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit inspections" },
      { status: 500 }
    );
  }
}
