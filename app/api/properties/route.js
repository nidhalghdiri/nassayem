// app/api/properties/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch all properties
export async function GET(request) {
  try {
    const properties = await prisma.property.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new property
export async function POST(request) {
  try {
    const data = await request.json();

    // Add default userId for testing (replace with actual user ID from auth)
    const propertyData = {
      ...data,
      userId: "12345", // TODO: Replace with actual user ID
      status: "AVAILABLE",
      price: parseFloat(data.price),
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      area: parseInt(data.area),
    };

    console.log("[POST] Create Property Data: ", propertyData);

    const property = await prisma.property.create({
      data: propertyData,
    });
    console.log("[POST] Created Property: ", property);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.log("[POST] ERROR Property: ", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error.message },
      { status: 500 }
    );
  }
}
