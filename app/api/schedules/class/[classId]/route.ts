import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
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

    const schedules = await Schedule.find({ classId: params.classId })
      .populate("classId", "name")
      .sort({ dayOfWeek: 1, startTime: 1 });

    return successResponse(schedules);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch schedules", 500);
  }
}

