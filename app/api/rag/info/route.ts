import { NextResponse } from "next/server";
import { getRagInfo } from "@/lib/api/client";

/**
 * GET /api/rag/info
 * 
 * Get information about the Vertex AI RAG Corpus configuration.
 * Useful for debugging and checking if RAG is properly configured.
 */
export async function GET() {
  try {
    const result = await getRagInfo();
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[API] RAG info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

