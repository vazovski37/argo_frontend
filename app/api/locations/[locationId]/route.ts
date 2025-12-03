import { NextRequest, NextResponse } from "next/server";
import { getLocation } from "@/lib/api/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;

    const result = await getLocation(locationId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get location error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

