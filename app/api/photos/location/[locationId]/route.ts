import { NextRequest, NextResponse } from "next/server";
import { getLocationPhotos } from "@/lib/api/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;

    const result = await getLocationPhotos(locationId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get location photos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

