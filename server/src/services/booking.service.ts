import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { decimalToNumber } from "../utils/serialize";
import { processPayment } from "./payment.service";
import { CreateBookingInput } from "../schemas/booking.schema";

export class BookingError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export async function createBooking(userId: string, input: CreateBookingInput) {
  const showtime = await prisma.showtime.findUnique({
    where: { id: input.showtimeId },
    include: { movie: true, theater: true },
  });

  if (!showtime) {
    throw new BookingError("Showtime not found", 404);
  }

  if (showtime.startTime <= new Date()) {
    throw new BookingError("Cannot book seats for a past showtime", 400);
  }

  const uniqueSeatIds = [...new Set(input.seatIds)];

  const seats = await prisma.seat.findMany({
    where: {
      id: { in: uniqueSeatIds },
      theaterId: showtime.theaterId,
    },
  });

  if (seats.length !== uniqueSeatIds.length) {
    throw new BookingError(
      "One or more seats are invalid for this showtime",
      400
    );
  }

  const pricePerSeat = decimalToNumber(showtime.price);
  const totalAmount = pricePerSeat * uniqueSeatIds.length;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.bookingSeat.findMany({
        where: {
          showtimeId: showtime.id,
          seatId: { in: uniqueSeatIds },
          booking: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
        select: { seatId: true },
      });

      if (existing.length > 0) {
        throw new BookingError(
          "One or more selected seats are no longer available",
          409
        );
      }

      const pendingBooking = await tx.booking.create({
        data: {
          userId,
          showtimeId: showtime.id,
          totalAmount,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      await tx.bookingSeat.createMany({
        data: uniqueSeatIds.map((seatId) => ({
          bookingId: pendingBooking.id,
          seatId,
          showtimeId: showtime.id,
        })),
      });

      const payment = await processPayment(totalAmount, userId);

      if (!payment.success) {
        throw new BookingError("Payment failed", 402);
      }

      return tx.booking.update({
        where: { id: pendingBooking.id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "COMPLETED",
          paymentId: payment.paymentId,
        },
        include: {
          bookingSeats: {
            include: { seat: true },
          },
          showtime: {
            include: { movie: true, theater: true },
          },
        },
      });
    });

    return formatBooking(booking);
  } catch (error) {
    if (error instanceof BookingError) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BookingError(
        "One or more selected seats are no longer available",
        409
      );
    }

    throw error;
  }
}

export async function getUserBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      bookingSeats: { include: { seat: true } },
      showtime: { include: { movie: true, theater: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map(formatBooking);
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { showtime: true },
  });

  if (!booking) {
    throw new BookingError("Booking not found", 404);
  }

  if (booking.userId !== userId) {
    throw new BookingError("Not authorized to cancel this booking", 403);
  }

  if (booking.status === "CANCELLED") {
    throw new BookingError("Booking is already cancelled", 400);
  }

  if (booking.showtime.startTime <= new Date()) {
    throw new BookingError("Cannot cancel a booking for a past showtime", 400);
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
    },
    include: {
      bookingSeats: { include: { seat: true } },
      showtime: { include: { movie: true, theater: true } },
    },
  });

  return formatBooking(updated);
}

function formatBooking(
  booking: Prisma.BookingGetPayload<{
    include: {
      bookingSeats: { include: { seat: true } };
      showtime: { include: { movie: true; theater: true } };
    };
  }>
) {
  return {
    id: booking.id,
    totalAmount: decimalToNumber(booking.totalAmount),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentId: booking.paymentId,
    createdAt: booking.createdAt.toISOString(),
    showtime: {
      id: booking.showtime.id,
      startTime: booking.showtime.startTime.toISOString(),
      endTime: booking.showtime.endTime.toISOString(),
      price: decimalToNumber(booking.showtime.price),
      movie: {
        id: booking.showtime.movie.id,
        title: booking.showtime.movie.title,
        posterUrl: booking.showtime.movie.posterUrl,
        durationMinutes: booking.showtime.movie.durationMinutes,
        genre: booking.showtime.movie.genre,
      },
      theater: {
        id: booking.showtime.theater.id,
        name: booking.showtime.theater.name,
        location: booking.showtime.theater.location,
      },
    },
    seats: booking.bookingSeats.map((bs) => ({
      row: bs.seat.row,
      seatNumber: bs.seat.seatNumber,
    })),
  };
}

export async function getShowtimeSeats(showtimeId: string) {
  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: { theater: true },
  });

  if (!showtime) {
    throw new BookingError("Showtime not found", 404);
  }

  const [seats, bookedSeats] = await Promise.all([
    prisma.seat.findMany({
      where: { theaterId: showtime.theaterId },
      orderBy: [{ row: "asc" }, { seatNumber: "asc" }],
    }),
    prisma.bookingSeat.findMany({
      where: {
        showtimeId,
        booking: {
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      },
      select: { seatId: true },
    }),
  ]);

  const bookedSet = new Set(bookedSeats.map((s) => s.seatId));

  return {
    showtime: {
      id: showtime.id,
      startTime: showtime.startTime.toISOString(),
      endTime: showtime.endTime.toISOString(),
      price: decimalToNumber(showtime.price),
      theater: showtime.theater,
    },
    seats: seats.map((seat) => ({
      id: seat.id,
      row: seat.row,
      seatNumber: seat.seatNumber,
      isBooked: bookedSet.has(seat.id),
    })),
  };
}

export async function getShowtimesByMovie(movieId: string) {
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });

  if (!movie) {
    throw new BookingError("Movie not found", 404);
  }

  const showtimes = await prisma.showtime.findMany({
    where: {
      movieId,
      startTime: { gt: new Date() },
    },
    include: { theater: true, movie: true },
    orderBy: { startTime: "asc" },
  });

  return showtimes.map((st) => ({
    id: st.id,
    movieId: st.movieId,
    theaterId: st.theaterId,
    startTime: st.startTime.toISOString(),
    endTime: st.endTime.toISOString(),
    price: decimalToNumber(st.price),
    theater: st.theater,
    movie: {
      id: st.movie.id,
      title: st.movie.title,
      durationMinutes: st.movie.durationMinutes,
    },
  }));
}
