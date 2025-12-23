import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { messageSchema } from "@/lib/validations";
import mongoose from "mongoose";

// Helper function to check if messaging is allowed
async function canMessage(
  senderId: string,
  receiverId: string
): Promise<boolean> {
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) return false;

  // Teacher can message Student or Parent
  if (sender.role === "Teacher") {
    return receiver.role === "Student" || receiver.role === "Parent";
  }

  // Student can message Teacher
  if (sender.role === "Student") {
    return receiver.role === "Teacher";
  }

  // Parent can message Teacher
  if (sender.role === "Parent") {
    return receiver.role === "Teacher";
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all conversations for the current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(session.user.id) },
            { receiverId: new mongoose.Types.ObjectId(session.user.id) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(session.user.id)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$receiverId",
                        new mongoose.Types.ObjectId(session.user.id),
                      ],
                    },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate user details
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv._id;
        const otherUser = await User.findById(otherUserId).select(
          "name email role"
        );
        return {
          ...conv.lastMessage,
          otherUser,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return successResponse(populatedConversations);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch conversations", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    await connectDB();

    // Check if messaging is allowed
    const allowed = await canMessage(session.user.id, validatedData.receiverId);
    if (!allowed) {
      return errorResponse("Messaging not allowed between these users", 403);
    }

    const message = await Message.create({
      senderId: session.user.id,
      receiverId: validatedData.receiverId,
      content: validatedData.content,
      attachments: validatedData.attachments || [],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role");

    return successResponse(populatedMessage, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to send message", 500);
  }
}

