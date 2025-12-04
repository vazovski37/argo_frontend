import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/api/cookies";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000/api";

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const groupId = searchParams.get("group_id");

    const params = new URLSearchParams({ filter });
    if (groupId) {
      params.append("group_id", groupId);
    }

    const response = await fetch(`${FLASK_API_URL}/photos/feed?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch photo feed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Get photo feed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

