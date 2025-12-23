import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import {
  requireAuth,
  successResponse,
  errorResponse,
} from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.classId)) {
      return errorResponse("Invalid class ID", 400);
    }

    const resources = await Resource.find({ classId: params.classId })
      .populate("classId", "name")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return successResponse(resources);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch resources", 500);
  }
}

