// Auth schemas
export * from "./auth";

// Game schemas
export * from "./game";

// Location schemas
export * from "./locations";

// Quest schemas
export * from "./quests";

// Photo schemas
export * from "./photos";

// RAG schemas
export * from "./rag";

// Common error response schema
import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// API response wrapper
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([
    z.object({ data: dataSchema, error: z.undefined() }),
    z.object({ data: z.undefined(), error: z.string() }),
  ]);

