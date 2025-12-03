/**
 * Zod schemas for RAG API responses
 */
import { z } from "zod";

// RAG search result item
export const RagResultSchema = z.object({
  content: z.string(),
  source: z.string().nullable(),
  score: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

// RAG query response
export const RagQueryResponseSchema = z.object({
  query: z.string(),
  results: z.array(RagResultSchema),
  context: z.string(),
  total: z.number(),
});

// RAG context response
export const RagContextResponseSchema = z.object({
  context: z.string(),
  user_visited: z.array(z.string()),
  source: z.enum(["vertex_ai", "local_fallback"]),
});

// RAG corpus info
export const RagCorpusInfoSchema = z.object({
  configured: z.boolean(),
  name: z.string().optional(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  create_time: z.string().nullable().optional(),
  error: z.string().optional(),
});

// RAG info response
export const RagInfoResponseSchema = z.object({
  project_id: z.string(),
  location: z.string(),
  corpus: RagCorpusInfoSchema,
});

// Export types
export type RagResult = z.infer<typeof RagResultSchema>;
export type RagQueryResponse = z.infer<typeof RagQueryResponseSchema>;
export type RagContextResponse = z.infer<typeof RagContextResponseSchema>;
export type RagCorpusInfo = z.infer<typeof RagCorpusInfoSchema>;
export type RagInfoResponse = z.infer<typeof RagInfoResponseSchema>;

