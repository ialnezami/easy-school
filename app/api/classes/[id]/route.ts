import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { classSchema } from "@/lib/validations";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid class ID", 400);
    }

    const classData = await Class.findById(params.id)
      .populate("teacherId", "name email")
      .populate("studentIds", "name email");

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(classData);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch class", 500);
  }
}

export async function PUT(
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

    const classData = await Class.findById(params.id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    if (classData.teacherId.toString() !== session.user.id) {
      return errorResponse("You can only update your own classes", 403);
    }

    const body = await request.json();
    const validatedData = classSchema.parse(body);

    const updatedClass = await Class.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    )
      .populate("teacherId", "name email")
      .populate("studentIds", "name email");

    return successResponse(updatedClass);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to update class", 500);
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

    const classData = await Class.findById(params.id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    if (classData.teacherId.toString() !== session.user.id) {
      return errorResponse("You can only delete your own classes", 403);
    }

    await Class.findByIdAndDelete(params.id);

    return successResponse({ message: "Class deleted successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to delete class", 500);
  }
}

