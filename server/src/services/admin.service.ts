import { prisma } from "../utils/prisma";
import { serializeMovie, serializeShowtime } from "../utils/serialize";
import {
  CreateMovieInput,
  UpdateMovieInput,
} from "../schemas/movie.schema";
import { CreateShowtimeInput } from "../schemas/showtime.schema";

export class AdminError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AdminError";
  }
}

export async function createMovie(input: CreateMovieInput) {
  const movie = await prisma.movie.create({
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      durationMinutes: input.durationMinutes,
      genre: input.genre.trim(),
      posterUrl: input.posterUrl ?? null,
      releaseDate: input.releaseDate,
    },
  });

  return serializeMovie(movie);
}

export async function updateMovie(id: string, input: UpdateMovieInput) {
  const existing = await prisma.movie.findUnique({ where: { id } });

  if (!existing) {
    throw new AdminError("Movie not found", 404);
  }

  const movie = await prisma.movie.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && {
        description: input.description.trim(),
      }),
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),
      ...(input.genre !== undefined && { genre: input.genre.trim() }),
      ...(input.posterUrl !== undefined && { posterUrl: input.posterUrl }),
      ...(input.releaseDate !== undefined && {
        releaseDate: input.releaseDate,
      }),
    },
  });

  return serializeMovie(movie);
}

export async function deleteMovie(id: string) {
  const existing = await prisma.movie.findUnique({ where: { id } });

  if (!existing) {
    throw new AdminError("Movie not found", 404);
  }

  await prisma.movie.delete({ where: { id } });

  return { message: "Movie deleted successfully" };
}

export async function createShowtime(input: CreateShowtimeInput) {
  const [movie, theater] = await Promise.all([
    prisma.movie.findUnique({ where: { id: input.movieId } }),
    prisma.theater.findUnique({ where: { id: input.theaterId } }),
  ]);

  if (!movie) {
    throw new AdminError("Movie not found", 404);
  }

  if (!theater) {
    throw new AdminError("Theater not found", 404);
  }

  const startTime = input.startTime;
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + movie.durationMinutes);

  const showtime = await prisma.showtime.create({
    data: {
      movieId: input.movieId,
      theaterId: input.theaterId,
      startTime,
      endTime,
      price: input.price,
    },
    include: { movie: true, theater: true },
  });

  return serializeShowtime(showtime);
}

export async function listAllBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      bookingSeats: { include: { seat: true } },
      showtime: { include: { movie: true, theater: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    totalAmount: Number(booking.totalAmount),
    createdAt: booking.createdAt.toISOString(),
    user: booking.user,
    showtime: {
      id: booking.showtime.id,
      startTime: booking.showtime.startTime.toISOString(),
      movie: { title: booking.showtime.movie.title },
      theater: { name: booking.showtime.theater.name },
    },
    seats: booking.bookingSeats.map((bs) => ({
      row: bs.seat.row,
      seatNumber: bs.seat.seatNumber,
    })),
  }));
}

export async function listTheaters() {
  return prisma.theater.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTheater(input: {
  name: string;
  location: string;
  rows: number;
  seatsPerRow: number;
}) {
  const totalSeats = input.rows * input.seatsPerRow;

  const theater = await prisma.theater.create({
    data: {
      name: input.name.trim(),
      location: input.location.trim(),
      totalSeats,
      seats: {
        create: Array.from({ length: input.rows }, (_, rowIndex) => {
          const row = String.fromCharCode(65 + rowIndex);
          return Array.from({ length: input.seatsPerRow }, (_, seatIndex) => ({
            row,
            seatNumber: seatIndex + 1,
          }));
        }).flat(),
      },
    },
    include: { seats: true },
  });

  return theater;
}
