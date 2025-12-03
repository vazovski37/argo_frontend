import { NextRequest, NextResponse } from "next/server";
import { deletePhoto } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { photoId } = await params;

    const result = await deletePhoto(token, photoId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Delete photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

