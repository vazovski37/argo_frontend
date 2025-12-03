import { NextResponse } from "next/server";
import { getStats } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";

export async function GET() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const result = await getStats(token);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

