import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET user by ID with extended statistics
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = id;

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
        sessions: {
          select: {
            createdAt: true,
            expires: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user statistics
    const [createdTasks, assignedTasks, inspections] = await Promise.all([
      prisma.task.count({
        where: { createdById: userId },
      }),
      prisma.task.count({
        where: { assignedToId: userId },
      }),
      prisma.inspection.count({
        where: { inspectorId: userId },
      }),
    ]);

    // Get task status breakdown
    const taskStatusStats = await prisma.task.groupBy({
      by: ["status"],
      where: { assignedToId: userId },
      _count: {
        _all: true,
      },
    });

    // Format the response
    const responseData = {
      user: {
        ...user,
        _count: {
          createdTasks,
          assignedTasks,
          inspections,
          completedTasks:
            taskStatusStats.find((s) => s.status === "COMPLETED")?._count
              ?._all || 0,
          pendingTasks:
            taskStatusStats.find((s) => s.status === "PENDING")?._count?._all ||
            0,
          inProgressTasks:
            taskStatusStats.find((s) => s.status === "IN_PROGRESS")?._count
              ?._all || 0,
        },
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to update users
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const data = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      // Check if email is already taken by another user
      if (data.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email.toLowerCase() },
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Email already taken" },
            { status: 400 }
          );
        }
        updateData.email = data.email.toLowerCase();
      }
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone ? data.phone.trim() : null;
    }

    if (data.buildingId !== undefined) {
      updateData.buildingId = data.buildingId || null;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    if (data.password !== undefined && data.password.length >= 6) {
      updateData.password = await hash(data.password, 12);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        building: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already taken" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete users" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records based on your schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
