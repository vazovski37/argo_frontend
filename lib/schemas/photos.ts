import { z } from "zod";

// Photo schema
export const PhotoSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  location_id: z.string().nullable().optional(),
  file_name: z.string().optional(),
  url: z.string(),
  caption: z.string().nullable().optional(),
  is_selfie: z.boolean().default(false),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  uploaded_at: z.string(),
  location: z.any().optional(),
});

export type Photo = z.infer<typeof PhotoSchema>;

// Photos response schema
export const PhotosResponseSchema = z.object({
  photos: z.array(PhotoSchema),
  total: z.number().optional(),
});

export type PhotosResponse = z.infer<typeof PhotosResponseSchema>;

// Upload photo response schema
export const UploadPhotoResponseSchema = z.object({
  photo: PhotoSchema,
  xp_earned: z.number(),
  new_achievements: z.array(z.any()).default([]),
});

export type UploadPhotoResponse = z.infer<typeof UploadPhotoResponseSchema>;

// Delete photo response schema
export const DeletePhotoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeletePhotoResponse = z.infer<typeof DeletePhotoResponseSchema>;

