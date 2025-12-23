import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import {
  requireAuth,
  successResponse,
  errorResponse,
  getSession,
} from "@/lib/api-helpers";
import { resourceSchema } from "@/lib/validations";

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

    const resources = await Resource.find(query)
      .populate("classId", "name")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return successResponse(resources);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch resources", 500);
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

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const classId = formData.get("classId") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const fileType = formData.get("fileType") as string;
    const fileSize = formData.get("fileSize") as string;
    const tags = formData.get("tags") as string;

    const validatedData = resourceSchema.parse({
      title,
      description,
      classId,
      tags: tags ? JSON.parse(tags) : [],
    });

    await connectDB();

    const resource = await Resource.create({
      ...validatedData,
      fileUrl,
      fileType,
      fileSize: fileSize ? parseInt(fileSize) : undefined,
      uploadedBy: session.user.id,
    });

    const populatedResource = await Resource.findById(resource._id)
      .populate("classId", "name")
      .populate("uploadedBy", "name email");

    return successResponse(populatedResource, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return errorResponse(error.message || "Failed to create resource", 500);
  }
}

