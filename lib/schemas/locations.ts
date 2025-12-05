import { z } from "zod";

// Location schema
export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  name_ka: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  xp_reward: z.number().default(50),
  image_url: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// Locations response schema
export const LocationsResponseSchema = z.object({
  locations: z.array(LocationSchema),
  total: z.number().optional(),
});

export type LocationsResponse = z.infer<typeof LocationsResponseSchema>;

// Location search request schema
export const LocationSearchRequestSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

export type LocationSearchRequest = z.infer<typeof LocationSearchRequestSchema>;

// Nearby locations request schema
export const NearbyLocationsRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number().default(5),
});

export type NearbyLocationsRequest = z.infer<typeof NearbyLocationsRequestSchema>;

// Nearby location schema (with distance)
export const NearbyLocationSchema = LocationSchema.extend({
  distance_km: z.number().optional(),
});

export type NearbyLocation = z.infer<typeof NearbyLocationSchema>;

// Nearby locations response schema
export const NearbyLocationsResponseSchema = z.object({
  locations: z.array(NearbyLocationSchema),
  total: z.number().optional(),
});

export type NearbyLocationsResponse = z.infer<typeof NearbyLocationsResponseSchema>;

// Location category schema
export const LocationCategorySchema = z.object({
  name: z.string(),
  count: z.number(),
});

export type LocationCategory = z.infer<typeof LocationCategorySchema>;

// Location categories response schema
export const LocationCategoriesResponseSchema = z.object({
  categories: z.array(LocationCategorySchema),
});

export type LocationCategoriesResponse = z.infer<typeof LocationCategoriesResponseSchema>;

