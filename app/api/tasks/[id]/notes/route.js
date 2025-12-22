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

    const { id } = params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, buildingId: true, assignedToId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    const isAssignedUser = session.user.id === task.assignedToId;

    if (!allowedRoles.includes(session.user.role) && !isAssignedUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // For receptionists, check building access
    if (
      session.user.role === "RECEPTIONIST" &&
      session.user.building.id !== task.buildingId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create note
    const note = await prisma.taskNote.create({
      data: {
        content: content.trim(),
        taskId: id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Create notification for assigned user if note added by someone else
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "task_note",
          title: "New Task Note",
          message: `A new note was added to task by ${session.user.name}`,
          recipientId: task.assignedToId,
          taskId: id,
        },
      });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, buildingId: true, assignedToId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    const allowedRoles = ["ADMIN", "DIRECTOR", "SUPERVISOR", "RECEPTIONIST"];
    const isAssignedUser = session.user.id === task.assignedToId;

    if (!allowedRoles.includes(session.user.role) && !isAssignedUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // For receptionists, check building access
    if (
      session.user.role === "RECEPTIONIST" &&
      session.user.building.id !== task.buildingId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get notes
    const notes = await prisma.taskNote.findMany({
      where: { taskId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
