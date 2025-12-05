import { NextRequest, NextResponse } from "next/server";
import { queryRag } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";
import { z } from "zod";

const QueryRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  top_k: z.number().int().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = QueryRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { query, top_k, threshold } = parseResult.data;
    
    // Get optional auth token (for personalized context)
    const token = await getAuthToken();
    
    const result = await queryRag(query, top_k, threshold, token || undefined);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] RAG query error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

