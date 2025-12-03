import { NextRequest, NextResponse } from "next/server";
import { getNearbyLocations } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "5");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const result = await getNearbyLocations(lat, lng, radius);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get nearby locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

