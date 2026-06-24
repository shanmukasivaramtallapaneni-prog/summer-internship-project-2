import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import type { Movie, Showtime } from "../types";
import SeatSelection from "../components/SeatSelection";

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<(Movie & { showtimes: Showtime[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getMovie(id)
      .then((data) => setMovie(data.movie as any))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load movie")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16">Loading movie details...</div>;
  if (error || !movie) return <div className="text-center py-16 text-red-400">{error || "Movie not found"}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] bg-surface-light rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No poster</div>
            )}
          </div>
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
            <span className="bg-white/5 px-3 py-1 rounded-full">{movie.genre}</span>
            <span className="bg-white/5 px-3 py-1 rounded-full">{movie.durationMinutes} min</span>
            <span className="bg-white/5 px-3 py-1 rounded-full">
              {new Date(movie.releaseDate).getFullYear()}
            </span>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mb-8">
            {movie.description}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
          Available Showtimes
        </h2>
        
        {movie.showtimes.length === 0 ? (
          <p className="text-gray-400 bg-surface-light p-6 rounded-xl border border-white/10">
            No upcoming showtimes available for this movie.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movie.showtimes.map((showtime) => {
              const date = new Date(showtime.startTime);
              const isSelected = selectedShowtimeId === showtime.id;
              
              return (
                <button
                  key={showtime.id}
                  onClick={() => setSelectedShowtimeId(showtime.id)}
                  className={`
                    text-left p-5 rounded-xl border transition-all
                    ${isSelected 
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(233,69,96,0.15)]" 
                      : "bg-surface-light border-white/10 hover:border-white/30"
                    }
                  `}
                >
                  <div className="text-lg font-bold text-white mb-1">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{showtime.theater?.name || "Standard Theater"}</span>
                    <span className="font-semibold text-primary">₹{showtime.price.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedShowtimeId && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <SeatSelection 
            showtimeId={selectedShowtimeId} 
            movieTitle={movie.title}
            theaterName={movie.showtimes.find(s => s.id === selectedShowtimeId)?.theater?.name || "Standard Theater"}
            startTime={movie.showtimes.find(s => s.id === selectedShowtimeId)?.startTime as any}
            price={movie.showtimes.find(s => s.id === selectedShowtimeId)?.price || 15}
          />
        </div>
      )}
    </div>
  );
}
