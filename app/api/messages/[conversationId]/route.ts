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

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.conversationId)) {
      return errorResponse("Invalid conversation ID", 400);
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: session.user.id,
          receiverId: params.conversationId,
        },
        {
          senderId: params.conversationId,
          receiverId: session.user.id,
        },
      ],
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: 1 });

    return successResponse(messages);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch messages", 500);
  }
}

