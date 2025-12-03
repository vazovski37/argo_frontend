import { NextRequest, NextResponse } from "next/server";
import { getQuest } from "@/lib/api/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  try {
    const { questId } = await params;

    const result = await getQuest(questId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Get quest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

