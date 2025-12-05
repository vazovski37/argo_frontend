import { NextRequest, NextResponse } from "next/server";
import { getRagContext } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/cookies";
import { z } from "zod";

const ContextRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  max_chunks: z.number().int().min(1).max(10).optional().default(5),
});

/**
 * POST /api/rag/context
 * 
 * Get formatted context from the Vertex AI RAG Corpus for AI prompts.
 * This is the main endpoint to call when the AI needs Poti-specific information.
 * 
 * Request body:
 *   - query: The user's question or topic
 *   - max_chunks: Maximum number of context chunks to return (default 5)
 * 
 * Response:
 *   - context: Formatted context string ready to add to AI prompts
 *   - user_visited: List of locations the user has visited
 *   - source: "vertex_ai" or "local_fallback"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = ContextRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { query, max_chunks } = parseResult.data;
    
    // Get optional auth token (for user-specific context like visited locations)
    const token = await getAuthToken();
    
    const result = await getRagContext(query, max_chunks, token || undefined);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] RAG context error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

