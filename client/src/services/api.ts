import type { AuthResponse, Booking, Movie } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL || "https://summer-internship-project-2-g24v.onrender.com").replace(/\/$/, "");

function buildUrl(path: string) {
  return `${API_BASE}${path.startsWith("/api") ? path : `/api${path}`}`;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string }).error || "Request failed",
      response.status
    );
  }

  return data as T;
}

export const api = {
  health: () =>
    request<{ status: string; message: string }>("/health"),

  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMovies: () => request<{ movies: Movie[] }>("/movies"),

  getMovie: (id: string) =>
    request<{ movie: Movie & { showtimes?: unknown[] } }>(`/movies/${id}`),

  getShowtimes: (movieId: string) =>
    request<{ showtimes: unknown[] }>(
      `/showtimes?movieId=${encodeURIComponent(movieId)}`
    ),

  getShowtimeSeats: (showtimeId: string, token: string) =>
    request<{ seats: { id: string; row: string; seatNumber: number; isBooked: boolean }[] }>(
      `/showtimes/${showtimeId}/seats`,
      {},
      token
    ),

  createBooking: (
    body: { showtimeId: string; seatIds: string[] },
    token: string
  ) =>
    request<{ booking: Booking }>(
      "/bookings",
      { method: "POST", body: JSON.stringify(body) },
      token
    ),

  getMyBookings: (token: string) =>
    request<{ bookings: Booking[] }>("/bookings/my-bookings", {}, token),

  cancelBooking: (bookingId: string, token: string) =>
    request<{ booking: Booking }>(
      `/bookings/${bookingId}`,
      { method: "DELETE" },
      token
    ),

  getBooking: (bookingId: string, token: string) =>
    request<{ booking: Booking }>(
      `/bookings/${bookingId}`,
      {},
      token
    ),

  // Admin APIs
  createMovie: (
    movie: Omit<Movie, "id" | "showtimes">,
    token: string
  ) =>
    request<{ movie: Movie }>("/admin/movies", {
      method: "POST",
      body: JSON.stringify(movie),
    }, token),

  deleteMovie: (id: string, token: string) =>
    request<{ success: boolean }>(`/admin/movies/${id}`, {
      method: "DELETE",
    }, token),

  getAllBookings: (token: string) =>
    request<{ bookings: Booking[] }>("/admin/bookings", {}, token),

  getAnalytics: (token: string) =>
    request<{ analytics: { totalRevenue: number; totalBookings: number; topMovie: string } }>("/admin/analytics", {}, token),
};

export { ApiError };
