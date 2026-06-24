export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  genre: string;
  posterUrl: string | null;
  releaseDate: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  startTime: string;
  endTime: string;
  price: number;
  movie?: Movie;
  theater?: Theater;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  totalSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  seatNumber: number;
  isBooked: boolean;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export interface Booking {
  id: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  showtime: Showtime & { movie: Movie; theater: Theater };
  seats: { row: string; seatNumber: number }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
