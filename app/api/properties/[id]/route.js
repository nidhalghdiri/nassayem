// app/api/properties/[id]/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single property
export async function GET(request, { params }) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true } },
        bookings: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch property", details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE property
export async function PUT(request, { params }) {
  try {
    const data = await request.json();

    // Prepare numeric fields
    const updateData = { ...data };
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.bedrooms) updateData.bedrooms = parseInt(data.bedrooms);
    if (data.bathrooms) updateData.bathrooms = parseInt(data.bathrooms);
    if (data.area) updateData.area = parseInt(data.area);

    const property = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update property", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE property
export async function DELETE(request, { params }) {
  try {
    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete property", details: error.message },
      { status: 500 }
    );
  }
}
