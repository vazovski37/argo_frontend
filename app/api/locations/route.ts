import { NextRequest, NextResponse } from "next/server";
import { getLocations, searchLocations } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q");

    // If there's a search query, use search endpoint
    if (query) {
      const result = await searchLocations(query);

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        );
      }

      return NextResponse.json(result.data);
    }

    // Otherwise, get all locations (optionally filtered by category)
    const result = await getLocations(category);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

