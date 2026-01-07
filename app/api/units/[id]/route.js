import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET unit by ID with detailed information
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unitId = params.id;

    // Get unit with all related data
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
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
            avatar: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Role-based access check
    if (session.user.role === "RECEPTIONIST") {
      if (unit.buildingId !== session.user.building.id) {
        return NextResponse.json(
          { error: "Access denied to this unit" },
          { status: 403 }
        );
      }
    }

    // Get unit statistics
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      activeBookings,
      totalInspections,
      passedInspections,
      recentTasks,
      upcomingBookings,
    ] = await Promise.all([
      // Task statistics
      prisma.task.count({
        where: { unitId },
      }),
      prisma.task.count({
        where: {
          unitId,
          status: "COMPLETED",
        },
      }),
      prisma.task.count({
        where: {
          unitId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      }),
      // Active bookings (pending or confirmed)
      prisma.booking.count({
        where: {
          unitId,
          status: { in: ["PENDING", "CONFIRMED"] },
          checkOut: {
            gte: new Date(),
          },
        },
      }),
      // Inspection statistics
      // prisma.inspection.count({
      //   where: { unitId },
      // }),
      // prisma.inspection.count({
      //   where: {
      //     unitId,
      //     status: "passed",
      //   },
      // }),
      // Recent tasks
      prisma.task.findMany({
        where: { unitId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Upcoming bookings
      prisma.booking.findMany({
        where: {
          unitId,
          status: "CONFIRMED",
          checkIn: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          guests: true,
          status: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { checkIn: "asc" },
        take: 5,
      }),
    ]);

    // Format the response
    const responseData = {
      unit,
      statistics: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
        bookings: {
          active: activeBookings,
        },
        inspections: {
          total: totalInspections,
          passed: passedInspections,
          passRate:
            totalInspections > 0
              ? Math.round((passedInspections / totalInspections) * 100)
              : 0,
        },
      },
      recentTasks,
      upcomingBookings,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

// PUT - Update unit (full update)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unitId = params.id;

    // Check if user has permission to update units
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        building: true,
      },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Role-based access check
    if (session.user.role === "RECEPTIONIST") {
      if (existingUnit.buildingId !== session.user.building.id) {
        return NextResponse.json(
          { error: "You can only update units in your assigned building" },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Validate required fields for full update
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

    // Update unit
    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        location: data.location.trim(),
        floor: data.floor.trim(),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        area: parseInt(data.area),
        status: data.status || existingUnit.status,
        buildingId: data.buildingId,
        images: data.images || [],
        amenities: data.amenities || [],
        updatedAt: new Date(),
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

    // If status changed to MAINTENANCE, create a maintenance task automatically
    if (
      existingUnit.status !== "MAINTENANCE" &&
      data.status === "MAINTENANCE"
    ) {
      try {
        await prisma.task.create({
          data: {
            title: `Maintenance Required - ${unit.title}`,
            description: `Unit marked as under maintenance. Please inspect and fix any issues.`,
            type: "MAINTENANCE",
            status: "PENDING",
            priority: "HIGH",
            unitId: unit.id,
            createdById: session.user.id,
          },
        });
      } catch (taskError) {
        console.error("Error creating maintenance task:", taskError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target[0];
      return NextResponse.json(
        { error: `Unit with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update unit
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unitId = params.id;

    // Check if user has permission to update units
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Role-based access check
    if (session.user.role === "RECEPTIONIST") {
      if (existingUnit.buildingId !== session.user.building.id) {
        return NextResponse.json(
          { error: "You can only update units in your assigned building" },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Prepare update data
    const updateData = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (!isNaN(price) && price > 0 && price <= 1000000) {
        updateData.price = price;
      }
    }

    if (data.location !== undefined) {
      updateData.location = data.location.trim();
    }

    if (data.floor !== undefined) {
      updateData.floor = data.floor.trim();
    }

    if (data.bedrooms !== undefined) {
      const bedrooms = parseInt(data.bedrooms);
      if (bedrooms >= 1 && bedrooms <= 20) {
        updateData.bedrooms = bedrooms;
      }
    }

    if (data.bathrooms !== undefined) {
      const bathrooms = parseInt(data.bathrooms);
      if (bathrooms >= 1 && bathrooms <= 20) {
        updateData.bathrooms = bathrooms;
      }
    }

    if (data.area !== undefined) {
      const area = parseInt(data.area);
      if (area >= 10 && area <= 5000) {
        updateData.area = area;
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.buildingId !== undefined) {
      updateData.buildingId = data.buildingId;
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
    }

    if (data.images !== undefined) {
      updateData.images = data.images;
    }

    if (data.amenities !== undefined) {
      updateData.amenities = data.amenities;
    }

    // Update unit
    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        ...updateData,
        updatedAt: new Date(),
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

    // If status changed to MAINTENANCE, create a maintenance task automatically
    if (
      existingUnit.status !== "MAINTENANCE" &&
      data.status === "MAINTENANCE"
    ) {
      try {
        await prisma.task.create({
          data: {
            title: `Maintenance Required - ${unit.title}`,
            description: `Unit marked as under maintenance. Please inspect and fix any issues.`,
            type: "MAINTENANCE",
            status: "PENDING",
            priority: "HIGH",
            unitId: unit.id,
            createdById: session.user.id,
          },
        });
      } catch (taskError) {
        console.error("Error creating maintenance task:", taskError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target[0];
      return NextResponse.json(
        { error: `Unit with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// DELETE - Delete unit
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete units
    const allowedRoles = ["ADMIN", "DIRECTOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only admins and directors can delete units.",
        },
        { status: 403 }
      );
    }

    const unitId = params.id;

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        tasks: {
          where: {
            status: { in: ["PENDING", "IN_PROGRESS"] },
          },
          select: {
            id: true,
            title: true,
          },
        },
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            OR: [
              { checkIn: { gte: new Date() } },
              { checkOut: { gte: new Date() } },
            ],
          },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
          },
        },
      },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if unit has active tasks
    if (existingUnit.tasks.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete unit with active tasks",
          details: {
            activeTasks: existingUnit.tasks.length,
            tasks: existingUnit.tasks.map((t) => ({
              id: t.id,
              title: t.title,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Check if unit has active bookings
    if (existingUnit.bookings.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete unit with active bookings",
          details: {
            activeBookings: existingUnit.bookings.length,
            bookings: existingUnit.bookings.map((b) => ({
              id: b.id,
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              status: b.status,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Delete unit (cascade will handle related records based on your schema)
    await prisma.unit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({
      success: true,
      message: "Unit deleted successfully",
      deletedUnit: {
        id: existingUnit.id,
        title: existingUnit.title,
        floor: existingUnit.floor,
      },
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
