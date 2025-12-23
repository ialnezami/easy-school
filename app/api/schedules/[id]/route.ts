import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { scheduleSchema } from "@/lib/validations";
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
      return errorResponse("Invalid schedule ID", 400);
    }

    const schedule = await Schedule.findById(params.id).populate(
      "classId",
      "name"
    );

    if (!schedule) {
      return errorResponse("Schedule not found", 404);
    }

    return successResponse(schedule);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch schedule", 500);
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
      return errorResponse("Invalid schedule ID", 400);
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Check for time conflicts (excluding current schedule)
    const conflictingSchedule = await Schedule.findOne({
      _id: { $ne: params.id },
      classId: validatedData.classId,
      dayOfWeek: validatedData.dayOfWeek,
      $or: [
        {
          startTime: { $lt: validatedData.endTime },
          endTime: { $gt: validatedData.startTime },
        },
      ],
    });

    if (conflictingSchedule) {
      return errorResponse("Time conflict detected", 400);
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    ).populate("classId", "name");

    if (!updatedSchedule) {
      return errorResponse("Schedule not found", 404);
    }

    return successResponse(updatedSchedule);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to update schedule", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAuth(request, ["Teacher"]);
    if (authError) return authError;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid schedule ID", 400);
    }

    const schedule = await Schedule.findByIdAndDelete(params.id);

    if (!schedule) {
      return errorResponse("Schedule not found", 404);
    }

    return successResponse({ message: "Schedule deleted successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to delete schedule", 500);
  }
}

