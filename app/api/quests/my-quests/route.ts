import { NextResponse } from "next/server";
import { getUserQuests } from "@/lib/api/client";
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

    const result = await getUserQuests(token);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get user quests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

