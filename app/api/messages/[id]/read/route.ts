import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import mongoose from "mongoose";

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
      return errorResponse("Invalid message ID", 400);
    }

    const message = await Message.findById(params.id);
    if (!message) {
      return errorResponse("Message not found", 404);
    }

    if (message.receiverId.toString() !== session.user.id) {
      return errorResponse("You can only mark your own messages as read", 403);
    }

    message.read = true;
    await message.save();

    return successResponse(message);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update message", 500);
  }
}

