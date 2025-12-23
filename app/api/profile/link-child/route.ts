import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { z } from "zod";
import mongoose from "mongoose";

const linkChildSchema = z.object({
  childId: z.string().min(1, "Child ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request, ["Parent"]);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = linkChildSchema.parse(body);

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(validatedData.childId)) {
      return errorResponse("Invalid child ID", 400);
    }

    const child = await User.findById(validatedData.childId);
    if (!child) {
      return errorResponse("Child not found", 404);
    }

    if (child.role !== "Student") {
      return errorResponse("Can only link to student accounts", 400);
    }

    // Update child's parentId
    child.parentId = new mongoose.Types.ObjectId(session.user.id);
    await child.save();

    // Update parent's linkedChildren
    const parent = await User.findById(session.user.id);
    if (parent) {
      if (!parent.linkedChildren) {
        parent.linkedChildren = [];
      }
      if (!parent.linkedChildren.includes(validatedData.childId)) {
        parent.linkedChildren.push(validatedData.childId);
        await parent.save();
      }
    }

    return successResponse({ message: "Child linked successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to link child", 500);
  }
}

