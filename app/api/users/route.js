import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all users (optional, for reference)
export async function GET(request) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const where = {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    };

    // Add role filter if specified
    if (role && role !== "all" && role !== "active" && role !== "inactive") {
      where.role = role;
    }

    // Add status filter if specified
    if (status === "active" || status === "inactive") {
      where.isActive = status === "active";
    }

    if (role === "staff") {
      where.role = { in: ["HOUSEKEEPING", "RECEPTIONIST", "SUPERVISOR"] };
    }
    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get stats for dashboard
    const stats = await prisma.user.groupBy({
      by: ["role", "isActive"],
      where: {
        isActive: true,
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      users,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create users
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Name is required and must be at least 2 characters";
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Valid email is required";
    }

    if (!data.password || data.password.length < 6) {
      errors.password =
        "Password is required and must be at least 6 characters";
    }

    if (data.phone && !/^[\d\s\+\-\(\)]{10,}$/.test(data.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        role: data.role || "HOUSEKEEPING",
        phone: data.phone ? data.phone.trim() : null,
        buildingId: data.buildingId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        building: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send welcome email if requested
    if (data.sendWelcomeEmail) {
      try {
        // You can implement email sending here
        // Example: await sendWelcomeEmail(user.email, data.password);
        console.log(`Welcome email would be sent to: ${user.email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}
