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

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    let query: any = {};

    if (classId) {
      query.classId = classId;
    }

    const schedules = await Schedule.find(query)
      .populate("classId", "name")
      .sort({ dayOfWeek: 1, startTime: 1 });

    return successResponse(schedules);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch schedules", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request, ["Teacher"]);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    await connectDB();

    // Check for time conflicts
    const conflictingSchedule = await Schedule.findOne({
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

    const schedule = await Schedule.create(validatedData);

    const populatedSchedule = await Schedule.findById(schedule._id).populate(
      "classId",
      "name"
    );

    return successResponse(populatedSchedule, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to create schedule", 500);
  }
}

