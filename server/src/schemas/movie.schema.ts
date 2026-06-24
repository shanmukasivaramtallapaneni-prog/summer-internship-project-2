import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  genre: z.string().min(1, "Genre is required"),
  posterUrl: z.string().url().optional().nullable(),
  releaseDate: z.coerce.date(),
});

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
