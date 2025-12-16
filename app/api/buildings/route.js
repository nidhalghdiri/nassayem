import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buildings = await prisma.building.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        _count: {
          select: {
            units: true,
            users: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ buildings });
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}
