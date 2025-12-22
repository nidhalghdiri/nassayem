import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all bookings for a specific unit
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
    const userId = searchParams.get("userId");
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
          { error: "Access denied to this unit's bookings" },
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

    if (userId && userId !== "all") {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = new Date(startDate);
      if (endDate) where.checkIn.lte = new Date(endDate);
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          totalPrice: true,
          status: true,
          guests: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          unit: {
            select: {
              id: true,
              title: true,
              floor: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          checkIn: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Get booking statistics for this unit
    const bookingStats = await prisma.booking.groupBy({
      by: ["status"],
      where: { unitId },
      _count: {
        _all: true,
      },
    });

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await prisma.booking.count({
      where: {
        unitId,
        status: "CONFIRMED",
        checkIn: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    });

    // Format statistics
    const statistics = {
      total,
      upcomingBookings,
      byStatus: {},
    };

    bookingStats.forEach((stat) => {
      statistics.byStatus[stat.status] = statistics.byStatus[stat.status] || 0;
      statistics.byStatus[stat.status] += stat._count._all;
    });

    return NextResponse.json({
      bookings,
      statistics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching unit bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit bookings" },
      { status: 500 }
    );
  }
}
