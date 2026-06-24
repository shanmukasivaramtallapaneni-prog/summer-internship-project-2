import { useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Seat } from "../types";

export default function SeatSelection({ 
  showtimeId, 
  movieTitle,
  theaterName,
  startTime,
  price
}: { 
  showtimeId: string;
  movieTitle: string;
  theaterName: string;
  startTime: string;
  price: number;
}) {
  const { token, user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    api
      .getShowtimeSeats(showtimeId, token)
      .then((data) => setSeats(data.seats))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load seats")
      )
      .finally(() => setLoading(false));
  }, [showtimeId, token, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-surface-light border border-white/10 rounded-xl p-8 text-center mt-8">
        <p className="text-gray-300 mb-4">You must be logged in to book seats.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Login to Book
        </button>
      </div>
    );
  }

  if (loading) return <p className="text-center py-8">Loading seats...</p>;
  if (error) return <p className="text-center py-8 text-red-400">{error}</p>;

  // Group seats by row
  const rows: Record<string, Seat[]> = {};
  seats.forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  const toggleSeat = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    const newSelection = new Set(selectedSeats);
    if (newSelection.has(seatId)) {
      newSelection.delete(seatId);
    } else {
      newSelection.add(seatId);
    }
    setSelectedSeats(newSelection);
  };

  const handleBooking = async () => {
    if (selectedSeats.size === 0 || !token) return;
    
    // Redirect to checkout with selected seats and summary data
    navigate("/checkout", {
      state: {
        showtimeId,
        seatIds: Array.from(selectedSeats),
        movieTitle,
        theaterName,
        startTime,
        price
      },
    });
  };

  return (
    <div className="mt-8 bg-surface-light border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6">Select Seats</h3>

      <div className="mb-8 overflow-x-auto">
        <div className="min-w-max mx-auto space-y-4">
          <div className="w-full h-8 bg-gray-600 rounded-t-[50%] mb-12 shadow-[0_-10px_20px_rgba(255,255,255,0.1)] flex items-center justify-center text-xs text-gray-300 tracking-widest uppercase">
            Screen
          </div>

          {Object.keys(rows).sort().map((rowName) => (
            <div key={rowName} className="flex items-center justify-center gap-4">
              <span className="w-6 text-center text-gray-500 font-bold">{rowName}</span>
              <div className="flex gap-2">
                {rows[rowName].sort((a, b) => a.seatNumber - b.seatNumber).map((seat) => {
                  const isSelected = selectedSeats.has(seat.id);
                  return (
                    <button
                      key={seat.id}
                      disabled={seat.isBooked}
                      onClick={() => toggleSeat(seat.id, seat.isBooked)}
                      className={`
                        w-10 h-10 rounded-t-lg flex items-center justify-center text-xs font-medium transition-all
                        ${
                          seat.isBooked
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                            : isSelected
                            ? "bg-primary text-white shadow-[0_0_15px_rgba(233,69,96,0.5)] border border-primary-dark translate-y-[-2px]"
                            : "bg-surface hover:bg-gray-700 text-gray-300 border border-gray-600"
                        }
                      `}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-center text-gray-500 font-bold">{rowName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-surface border border-gray-600 rounded-t-sm"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary border border-primary-dark rounded-t-sm shadow-[0_0_8px_rgba(233,69,96,0.5)]"></div> Selected</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded-t-sm"></div> Booked</div>
      </div>

      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-gray-400">Selected Seats: <span className="text-white font-bold">{selectedSeats.size}</span></p>
        </div>
        <button
          disabled={selectedSeats.size === 0}
          onClick={handleBooking}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Book Tickets
        </button>
      </div>
    </div>
  );
}
