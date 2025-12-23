import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request, ["Teacher"]);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid class ID", 400);
    }

    const { studentId } = await request.json();

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse("Valid student ID is required", 400);
    }

    const classData = await Class.findById(params.id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    if (classData.teacherId.toString() !== session.user.id) {
      return errorResponse("You can only modify your own classes", 403);
    }

    if (!classData.studentIds.includes(studentId)) {
      classData.studentIds.push(studentId);
      await classData.save();
    }

    const updatedClass = await Class.findById(params.id)
      .populate("teacherId", "name email")
      .populate("studentIds", "name email");

    return successResponse(updatedClass);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to add student", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request, ["Teacher"]);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid class ID", 400);
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse("Valid student ID is required", 400);
    }

    const classData = await Class.findById(params.id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    if (classData.teacherId.toString() !== session.user.id) {
      return errorResponse("You can only modify your own classes", 403);
    }

    classData.studentIds = classData.studentIds.filter(
      (id) => id.toString() !== studentId
    );
    await classData.save();

    const updatedClass = await Class.findById(params.id)
      .populate("teacherId", "name email")
      .populate("studentIds", "name email");

    return successResponse(updatedClass);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to remove student", 500);
  }
}

