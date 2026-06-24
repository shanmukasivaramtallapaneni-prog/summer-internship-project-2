import { z } from "zod";

export const createShowtimeSchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
  theaterId: z.string().min(1, "Theater ID is required"),
  startTime: z.coerce.date(),
  price: z.number().positive("Price must be positive"),
});

export type CreateShowtimeInput = z.infer<typeof createShowtimeSchema>;
