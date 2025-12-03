/**
 * React hook for interacting with the RAG (Retrieval-Augmented Generation) service.
 * 
 * Use this hook when your AI needs specific Poti information from the knowledge base.
 */

import { useState, useCallback } from "react";
import type { RagContextResponse, RagQueryResponse } from "@/lib/schemas/rag";

interface UseRagOptions {
  maxChunks?: number;
  topK?: number;
  threshold?: number;
}

interface UseRagReturn {
  // State
  context: string | null;
  results: RagQueryResponse["results"] | null;
  isLoading: boolean;
  error: string | null;
  source: "vertex_ai" | "local_fallback" | null;
  
  // Actions
  getContext: (query: string) => Promise<string>;
  query: (searchQuery: string) => Promise<RagQueryResponse["results"]>;
  clearContext: () => void;
}

export function useRag(options: UseRagOptions = {}): UseRagReturn {
  const { maxChunks = 5, topK = 5, threshold = 0.5 } = options;
  
  const [context, setContext] = useState<string | null>(null);
  const [results, setResults] = useState<RagQueryResponse["results"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"vertex_ai" | "local_fallback" | null>(null);
  
  /**
   * Get formatted context for AI prompts about Poti.
   * This is the main function to call when you need Poti-specific information.
   */
  const getContext = useCallback(async (query: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/rag/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, max_chunks: maxChunks }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get RAG context");
      }
      
      const data: RagContextResponse = await response.json();
      setContext(data.context);
      setSource(data.source);
      
      return data.context;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [maxChunks]);
  
  /**
   * Query the RAG knowledge base and get raw results.
   * Use this when you need more control over the retrieved information.
   */
  const query = useCallback(async (searchQuery: string): Promise<RagQueryResponse["results"]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: searchQuery, 
          top_k: topK, 
          threshold 
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to query RAG");
      }
      
      const data: RagQueryResponse = await response.json();
      setResults(data.results);
      setContext(data.context);
      
      return data.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [topK, threshold]);
  
  /**
   * Clear the current context and results.
   */
  const clearContext = useCallback(() => {
    setContext(null);
    setResults(null);
    setSource(null);
    setError(null);
  }, []);
  
  return {
    context,
    results,
    isLoading,
    error,
    source,
    getContext,
    query,
    clearContext,
  };
}

/**
 * Helper function to fetch RAG context without using the hook.
 * Useful in non-React contexts or for one-off queries.
 */
export async function fetchRagContext(
  query: string,
  maxChunks = 5
): Promise<RagContextResponse> {
  const response = await fetch("/api/rag/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, max_chunks: maxChunks }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to get RAG context");
  }
  
  return response.json();
}

