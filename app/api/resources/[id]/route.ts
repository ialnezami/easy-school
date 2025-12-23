import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { resourceSchema } from "@/lib/validations";
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
      return errorResponse("Invalid resource ID", 400);
    }

    const resource = await Resource.findById(params.id)
      .populate("classId", "name")
      .populate("uploadedBy", "name email");

    if (!resource) {
      return errorResponse("Resource not found", 404);
    }

    return successResponse(resource);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch resource", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid resource ID", 400);
    }

    const resource = await Resource.findById(params.id);
    if (!resource) {
      return errorResponse("Resource not found", 404);
    }

    if (resource.uploadedBy.toString() !== session.user.id) {
      return errorResponse("You can only update your own resources", 403);
    }

    const body = await request.json();
    const validatedData = resourceSchema.parse(body);

    const updatedResource = await Resource.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    )
      .populate("classId", "name")
      .populate("uploadedBy", "name email");

    return successResponse(updatedResource);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to update resource", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid resource ID", 400);
    }

    const resource = await Resource.findById(params.id);
    if (!resource) {
      return errorResponse("Resource not found", 404);
    }

    if (resource.uploadedBy.toString() !== session.user.id) {
      return errorResponse("You can only delete your own resources", 403);
    }

    await Resource.findByIdAndDelete(params.id);

    return successResponse({ message: "Resource deleted successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to delete resource", 500);
  }
}

