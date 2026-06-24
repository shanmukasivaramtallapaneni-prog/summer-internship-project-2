import { Decimal } from "@prisma/client/runtime/library";

export function decimalToNumber(value: Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

export function serializeMovie<T extends { releaseDate: Date }>(movie: T) {
  return {
    ...movie,
    releaseDate: movie.releaseDate.toISOString(),
  };
}

export function serializeShowtime<
  T extends { startTime: Date; endTime: Date; price: Decimal | number },
>(showtime: T) {
  return {
    ...showtime,
    startTime: showtime.startTime.toISOString(),
    endTime: showtime.endTime.toISOString(),
    price: decimalToNumber(showtime.price),
  };
}

export function serializeBooking<
  T extends {
    totalAmount: Decimal | number;
    createdAt: Date;
    showtime?: {
      startTime: Date;
      endTime: Date;
      price: Decimal | number;
    } | null;
  },
>(booking: T) {
  return {
    ...booking,
    totalAmount: decimalToNumber(booking.totalAmount),
    createdAt: booking.createdAt.toISOString(),
    showtime: booking.showtime
      ? serializeShowtime(booking.showtime)
      : booking.showtime,
  };
}
