import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const data = await request.json();

    // Save draft to database (optional - you could also use Redis or just localStorage)
    const draft = await prisma.inspectionDraft.upsert({
      where: {
        taskId_inspectorId: {
          taskId: taskId,
          inspectorId: session.user.id,
        },
      },
      update: {
        checklist: data.checklist,
        issues: data.issues,
        notes: data.notes,
        photos: data.photos,
        lastSaved: new Date(),
      },
      create: {
        taskId: taskId,
        inspectorId: session.user.id,
        checklist: data.checklist,
        issues: data.issues,
        notes: data.notes,
        photos: data.photos,
        lastSaved: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully",
      draft,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;

    const draft = await prisma.inspectionDraft.findUnique({
      where: {
        taskId_inspectorId: {
          taskId: taskId,
          inspectorId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      draft: draft || null,
    });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}
