import { useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Booking } from "../types";
import { Link } from "react-router-dom";

export default function MyBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchBookings();
  }, [token]);

  const fetchBookings = () => {
    setLoading(true);
    api
      .getMyBookings(token!)
      .then((data) => setBookings(data.bookings))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load bookings")
      )
      .finally(() => setLoading(false));
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId, token!);
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to cancel booking");
      setCancellingId(null);
    }
  };

  if (loading) return <div className="text-center py-16">Loading your bookings...</div>;
  if (error) return <div className="text-center py-16 text-red-400">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-gray-400 mb-10">Manage your upcoming and past movie tickets.</p>

      {bookings.length === 0 ? (
        <div className="bg-surface-light border border-white/10 p-12 rounded-xl text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎟️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
          <p className="text-gray-400 mb-6">You haven't booked any movies. Explore what's showing now!</p>
          <Link
            to="/"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const date = new Date(booking.showtime.startTime);
            const isPast = date < new Date();
            const canCancel = !isPast && booking.status !== "CANCELLED";

            return (
              <div
                key={booking.id}
                className="bg-surface-light border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row"
              >
                <div className="w-full md:w-48 aspect-[2/3] md:aspect-auto md:h-full bg-accent relative shrink-0">
                  {booking.showtime.movie.posterUrl ? (
                    <img
                      src={booking.showtime.movie.posterUrl}
                      alt={booking.showtime.movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No poster
                    </div>
                  )}
                  {booking.status === "CANCELLED" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-red-500 font-bold border-2 border-red-500 px-3 py-1 rounded-lg rotate-12">
                        CANCELLED
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold">
                        {booking.showtime.movie.title}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 
                          booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 
                          'bg-yellow-500/20 text-yellow-400'}
                      `}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm mt-6 mb-6">
                      <div>
                        <p className="text-gray-500 mb-1">Date & Time</p>
                        <p className="text-gray-200 font-medium">
                          {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                          <br />
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Theater</p>
                        <p className="text-gray-200 font-medium">
                          {booking.showtime.theater.name}
                          <br />
                          <span className="text-gray-400">{booking.showtime.theater.location}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Seats ({booking.seats.length})</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {booking.seats.map((seat, i) => (
                            <span key={i} className="bg-surface px-2 py-1 border border-white/10 rounded text-xs font-mono">
                              {seat.row}{seat.seatNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Total Amount</p>
                        <p className="text-primary font-bold text-lg">₹{booking.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Booking ID: {booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>

                  {canCancel && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-right">
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
