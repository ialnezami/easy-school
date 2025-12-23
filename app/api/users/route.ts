import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  requireAuth,
  successResponse,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role");

    let query: any = {};

    if (email) {
      query.email = email;
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password");

    return successResponse(users);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch users", 500);
  }
}

