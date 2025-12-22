import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all units with filters and pagination
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
    const buildingId = searchParams.get("buildingId");
    const search = searchParams.get("search") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minBedrooms = searchParams.get("minBedrooms");
    const maxBedrooms = searchParams.get("maxBedrooms");

    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const where = {
      OR: [
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
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          floor: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    };

    // Add status filter if specified
    if (status && status !== "all") {
      where.status = status;
    }

    // Add building filter if specified
    if (buildingId && buildingId !== "all") {
      where.buildingId = buildingId;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Add bedrooms range filter
    if (minBedrooms || maxBedrooms) {
      where.bedrooms = {};
      if (minBedrooms) where.bedrooms.gte = parseInt(minBedrooms);
      if (maxBedrooms) where.bedrooms.lte = parseInt(maxBedrooms);
    }

    // Role-based filtering
    if (session.user.role === "RECEPTIONIST" && session.user.building.id) {
      where.buildingId = session.user.building.id;
    }

    // Get units with pagination
    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          floor: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          status: true,
          images: true,
          amenities: true,
          createdAt: true,
          updatedAt: true,
          building: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              tasks: {
                where: {
                  status: {
                    in: ["PENDING", "IN_PROGRESS"],
                  },
                },
              },
              inspections: true,
              bookings: {
                where: {
                  status: {
                    in: ["PENDING", "CONFIRMED"],
                  },
                },
              },
            },
          },
          tasks: {
            where: {
              status: {
                in: ["PENDING", "IN_PROGRESS"],
              },
            },
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              priority: true,
            },
            take: 3,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.unit.count({ where }),
    ]);

    // Get statistics for dashboard
    const stats = await prisma.unit.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    // Get building list for filters
    const buildings = await prisma.building.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      units,
      stats,
      buildings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// POST - Create new unit
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create units
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Additional check for receptionists - can only create units in their building
    if (session.user.role === "RECEPTIONIST") {
      const data = await request.json();
      if (data.buildingId !== session.user.building.id) {
        return NextResponse.json(
          { error: "You can only create units in your assigned building" },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Validate required fields
    const errors = {};

    if (!data.title || data.title.trim().length < 3) {
      errors.title = "Title is required and must be at least 3 characters";
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.description =
        "Description is required and must be at least 10 characters";
    }

    if (
      !data.price ||
      isNaN(data.price) ||
      parseFloat(data.price) <= 0 ||
      parseFloat(data.price) > 1000000
    ) {
      errors.price = "Valid price is required (1 - 1,000,000)";
    }

    if (!data.location || data.location.trim().length < 5) {
      errors.location = "Location is required";
    }

    if (!data.floor || data.floor.trim().length === 0) {
      errors.floor = "Floor is required";
    }

    if (!data.bedrooms || data.bedrooms < 1 || data.bedrooms > 20) {
      errors.bedrooms = "Valid number of bedrooms is required (1-20)";
    }

    if (!data.bathrooms || data.bathrooms < 1 || data.bathrooms > 20) {
      errors.bathrooms = "Valid number of bathrooms is required (1-20)";
    }

    if (!data.area || data.area < 10 || data.area > 5000) {
      errors.area = "Valid area is required (10-5000 m²)";
    }

    if (!data.buildingId) {
      errors.buildingId = "Building selection is required";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
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

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        location: data.location.trim(),
        floor: data.floor.trim(),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        area: parseInt(data.area),
        status: data.status || "AVAILABLE",
        buildingId: data.buildingId,
        userId: session.user.id,
        images: data.images || [],
        amenities: data.amenities || [],
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        location: true,
        floor: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        status: true,
        images: true,
        amenities: true,
        createdAt: true,
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Unit created successfully",
        unit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating unit:", error);

    // Handle unique constraint violations
    if (error.code === "P2002") {
      const field = error.meta?.target[0];
      return NextResponse.json(
        { error: `Unit with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create unit. Please try again." },
      { status: 500 }
    );
  }
}
