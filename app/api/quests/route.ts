import { NextRequest, NextResponse } from "next/server";
import { getQuests } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDaily = searchParams.get("daily") !== "false";

    const result = await getQuests(includeDaily);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get quests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

