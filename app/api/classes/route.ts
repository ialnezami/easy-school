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

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const studentId = searchParams.get("studentId");

    let query: any = {};

    if (teacherId) {
      query.teacherId = teacherId;
    }

    if (studentId) {
      query.studentIds = studentId;
    }

    const classes = await Class.find(query)
      .populate("teacherId", "name email")
      .populate("studentIds", "name email")
      .sort({ createdAt: -1 });

    return successResponse(classes);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch classes", 500);
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
    const validatedData = classSchema.parse(body);

    await connectDB();

    const newClass = await Class.create({
      ...validatedData,
      teacherId: session.user.id,
      studentIds: [],
    });

    const populatedClass = await Class.findById(newClass._id)
      .populate("teacherId", "name email")
      .populate("studentIds", "name email");

    return successResponse(populatedClass, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return errorResponse(error.message || "Failed to create class", 500);
  }
}

