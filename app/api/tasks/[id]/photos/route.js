import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all photos for a task
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;

    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, buildingId: true, assignedToId: true },
    });

    if (!taskExists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check access permissions
    let hasAccess = false;

    switch (session.user.role) {
      case "ADMIN":
      case "DIRECTOR":
      case "SUPERVISOR":
        hasAccess = true;
        break;
      case "RECEPTIONIST":
        hasAccess = taskExists.buildingId === session.user.building.id;
        break;
      case "HOUSEKEEPING":
        hasAccess = taskExists.assignedToId === session.user.id;
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to task photos" },
        { status: 403 }
      );
    }

    const photos = await prisma.photo.findMany({
      where: { taskId },
      select: {
        id: true,
        url: true,
        caption: true,
        createdAt: true,
        uploadedBy: {
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

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching task photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch task photos" },
      { status: 500 }
    );
  }
}

// POST - Add photo to task
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const data = await request.json();

    if (!data.url) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions - only assigned user, creator, or supervisors can add photos
    let canAddPhoto = false;

    switch (session.user.role) {
      case "ADMIN":
      case "DIRECTOR":
      case "SUPERVISOR":
        canAddPhoto = true;
        break;
      case "RECEPTIONIST":
        canAddPhoto = task.buildingId === session.user.building.id;
        break;
      case "HOUSEKEEPING":
        canAddPhoto = task.assignedToId === session.user.id;
        break;
      default:
        canAddPhoto = false;
    }

    if (!canAddPhoto) {
      return NextResponse.json(
        { error: "Insufficient permissions to add photos to this task" },
        { status: 403 }
      );
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        url: data.url,
        caption: data.caption?.trim(),
        taskId,
        uploadedById: session.user.id,
      },
      select: {
        id: true,
        url: true,
        caption: true,
        createdAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Create notifications
    const notifications = [];

    // Notify task creator if not the photo uploader
    if (task.createdById !== session.user.id) {
      notifications.push({
        type: "task_photo_added",
        title: "Photo added to task",
        message: `${session.user.name} added a photo to task: ${task.title}`,
        recipientId: task.createdById,
        taskId,
      });
    }

    // Notify assigned user if exists and not the uploader
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      notifications.push({
        type: "task_photo_added",
        title: "Photo added to task",
        message: `${session.user.name} added a photo to task: ${task.title}`,
        recipientId: task.assignedToId,
        taskId,
      });
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Photo added successfully",
        photo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding task photo:", error);
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 });
  }
}

// DELETE - Remove photo from task
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Check if photo exists and get task info
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            buildingId: true,
            assignedToId: true,
            createdById: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Check permissions
    let canDeletePhoto = false;

    switch (session.user.role) {
      case "ADMIN":
      case "DIRECTOR":
        canDeletePhoto = true;
        break;
      case "SUPERVISOR":
        canDeletePhoto = true;
        break;
      case "RECEPTIONIST":
        canDeletePhoto = photo.task.buildingId === session.user.building.id;
        break;
      case "HOUSEKEEPING":
        // Can delete own photos or if assigned to task
        canDeletePhoto =
          photo.uploadedById === session.user.id ||
          photo.task.assignedToId === session.user.id;
        break;
      default:
        canDeletePhoto = false;
    }

    if (!canDeletePhoto) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this photo" },
        { status: 403 }
      );
    }

    // Delete photo
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
