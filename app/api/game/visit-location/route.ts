import { NextRequest, NextResponse } from "next/server";
import { visitLocation } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";
import { VisitLocationRequestSchema } from "@/lib/schemas/game";

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parseResult = VisitLocationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { location_id, location_name } = parseResult.data;

    const result = await visitLocation(token, location_id, location_name);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Visit location error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

