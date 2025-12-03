import { NextRequest, NextResponse } from "next/server";
import { learnPhrase } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";
import { LearnPhraseRequestSchema } from "@/lib/schemas/game";

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
    const parseResult = LearnPhraseRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phrase, meaning } = parseResult.data;

    const result = await learnPhrase(token, phrase, meaning);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] Learn phrase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

