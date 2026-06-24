import { Request, Response } from "express";
import { z } from "zod";
import {
  BookingError,
  cancelBooking,
  createBooking,
  getShowtimeSeats,
  getShowtimesByMovie,
  getUserBookings,
} from "../services/booking.service";
import { CreateBookingInput } from "../schemas/booking.schema";

const movieIdQuerySchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
});

export async function listShowtimes(req: Request, res: Response) {
  try {
    const { movieId } = movieIdQuerySchema.parse(req.query);
    const showtimes = await getShowtimesByMovie(movieId);
    res.json({ showtimes });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message });
      return;
    }
    throw error;
  }
}

export async function showtimeSeats(req: Request, res: Response) {
  try {
    const result = await getShowtimeSeats(req.params.id as string);
    res.json(result);
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function createBookingHandler(req: Request, res: Response) {
  try {
    const booking = await createBooking(
      req.user!.userId,
      req.body as CreateBookingInput
    );
    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message });
      return;
    }
    throw error;
  }
}

export async function myBookings(req: Request, res: Response) {
  try {
    const bookings = await getUserBookings(req.user!.userId);
    res.json({ bookings });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
}

export async function getBookingByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const bookings = await getUserBookings(req.user!.userId);
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
}

export async function cancelBookingHandler(req: Request, res: Response) {
  try {
    const booking = await cancelBooking(req.user!.userId, req.params.id as string);
    res.json({ booking });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}
