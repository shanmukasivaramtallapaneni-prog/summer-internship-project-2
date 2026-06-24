import { z } from "zod";

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, "Showtime ID is required"),
  seatIds: z
    .array(z.string().min(1, "Invalid seat ID"))
    .min(1, "Select at least one seat"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
