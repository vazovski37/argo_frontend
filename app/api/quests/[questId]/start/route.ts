import { NextRequest, NextResponse } from "next/server";
import { startQuest } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { questId } = await params;

    const result = await startQuest(token, questId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Start quest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

