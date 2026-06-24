import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../schemas/movie.schema";
import { createShowtimeSchema } from "../schemas/showtime.schema";
import {
  AdminError,
  createMovie,
  createShowtime,
  createTheater,
  deleteMovie,
  listAllBookings,
  listTheaters,
  updateMovie,
} from "../services/admin.service";

const createTheaterSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  rows: z.number().int().min(1).max(26),
  seatsPerRow: z.number().int().min(1).max(30),
});

export async function createMovieHandler(req: Request, res: Response) {
  try {
    const input = createMovieSchema.parse(req.body);
    const movie = await createMovie(input);
    res.status(201).json({ movie });
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function updateMovieHandler(req: Request, res: Response) {
  try {
    const input = updateMovieSchema.parse(req.body);
    const movie = await updateMovie(req.params.id as string, input);
    res.json({ movie });
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function deleteMovieHandler(req: Request, res: Response) {
  try {
    const result = await deleteMovie(req.params.id as string);
    res.json(result);
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function createShowtimeHandler(req: Request, res: Response) {
  try {
    const input = createShowtimeSchema.parse(req.body);
    const showtime = await createShowtime(input);
    res.status(201).json({ showtime });
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function listBookingsHandler(_req: Request, res: Response) {
  try {
    const bookings = await listAllBookings();
    res.json({ bookings });
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function getAllBookings(req: Request, res: Response) {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        showtime: {
          include: {
            movie: true,
            theater: true,
          },
        },
        bookingSeats: {
          include: { seat: true }
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedBookings = bookings.map((b: any) => ({
      ...b,
      seats: b.bookingSeats.map((bs: any) => bs.seat),
      bookingSeats: undefined,
    }));
    
    res.json({ bookings: formattedBookings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}

export async function getAnalytics(req: Request, res: Response) {
  try {
    const totalBookings = await prisma.booking.count();
    
    // Calculate total revenue (sum of all booked seats * showtime price)
    const bookings = await prisma.booking.findMany({
      include: {
        showtime: true,
        bookingSeats: true
      }
    });
    
    const totalRevenue = bookings.reduce((sum: number, booking: any) => {
      if (booking.status !== "CANCELLED") {
        return sum + (booking.bookingSeats.length * booking.showtime.price);
      }
      return sum;
    }, 0);

    const movies = await prisma.movie.findMany({
      include: {
        showtimes: {
          include: {
            bookings: {
              include: { bookingSeats: true }
            }
          }
        }
      }
    });

    const topMovie = movies.map((movie: any) => {
      const ticketsSold = movie.showtimes.reduce((sum: number, st: any) => 
        sum + st.bookings.reduce((bSum: number, b: any) => bSum + (b.status !== "CANCELLED" ? b.bookingSeats.length : 0), 0)
      , 0);
      return { title: movie.title, ticketsSold };
    }).sort((a: any, b: any) => b.ticketsSold - a.ticketsSold)[0];

    res.json({ 
      analytics: {
        totalRevenue,
        totalBookings,
        topMovie: topMovie?.title || "N/A"
      } 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

export async function listTheatersHandler(_req: Request, res: Response) {
  try {
    const theaters = await listTheaters();
    res.json({ theaters });
  } catch (error) {
    handleAdminError(error, res);
  }
}

export async function createTheaterHandler(req: Request, res: Response) {
  try {
    const input = createTheaterSchema.parse(req.body);
    const theater = await createTheater(input);
    res.status(201).json({ theater });
  } catch (error) {
    handleAdminError(error, res);
  }
}

function handleAdminError(error: unknown, res: Response) {
  if (error instanceof AdminError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: error.errors[0]?.message });
    return;
  }
  throw error;
}
