import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import type { Movie } from "../types";
import { Play, ChevronRight, Star, Film } from "lucide-react";
import toast from "react-hot-toast";

function MovieSkeleton() {
  return (
    <div className="bg-surface-light rounded-xl overflow-hidden animate-pulse border border-white/5">
      <div className="aspect-[2/3] bg-white/5 w-full"></div>
      <div className="p-4">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-white/10 rounded w-full"></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    api
      .getMovies()
      .then((data) => setMovies(data.movies))
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load movies")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(movies.length, 3));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  const featuredMovie = movies[heroIndex];

  return (
    <div className="-mt-8">
      {/* Hero Carousel */}
      {loading ? (
        <div className="w-full h-[60vh] md:h-[70vh] bg-surface-light animate-pulse mb-12"></div>
      ) : featuredMovie ? (
        <div className="relative w-[100vw] ml-[calc(-50vw+50%)] h-[60vh] md:h-[70vh] mb-12 overflow-hidden group">
          <div className="absolute inset-0">
            <img 
              src={featuredMovie.posterUrl || "https://placehold.co/400x600/1a1a2e/e94560?text=No+Poster"} 
              alt={featuredMovie.title} 
              className="w-full h-full object-cover opacity-40 mix-blend-screen scale-105 group-hover:scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
            <div className="max-w-2xl animate-in slide-in-from-bottom-8 duration-700">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                Now Showing
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
                {featuredMovie.title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-300 mb-6">
                <span className="flex items-center gap-1 text-yellow-500"><Star className="w-4 h-4 fill-current" /> 4.8</span>
                <span>{featuredMovie.genre}</span>
                <span>{featuredMovie.durationMinutes} min</span>
              </div>
              <p className="text-lg text-gray-400 mb-8 line-clamp-2 max-w-xl">
                {featuredMovie.description}
              </p>
              <div className="flex gap-4">
                <Link
                  to={`/movies/${featuredMovie.id}`}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current" /> Book Tickets
                </Link>
                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors border border-white/5">
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {movies.slice(0, 3).map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-2 rounded-full transition-all ${i === heroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Movie Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Trending Now
            </h2>
          </div>
          <button className="text-primary hover:text-white font-bold text-sm flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <MovieSkeleton key={i} />)
            : movies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  className="group bg-surface-light rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(233,69,96,0.15)] hover:-translate-y-2 flex flex-col"
                >
                  <div className="aspect-[2/3] overflow-hidden relative">
                    <img
                      src={movie.posterUrl || "https://placehold.co/400x600/1a1a2e/e94560?text=No+Poster"}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-light via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <span className="bg-primary text-white font-bold px-6 py-2 rounded-full text-sm shadow-lg">
                        Get Tickets
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-lg font-bold mb-1 truncate group-hover:text-primary transition-colors">
                      {movie.title}
                    </h2>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <p className="text-sm text-gray-400">{movie.genre}</p>
                      <p className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-300">
                        {movie.durationMinutes}m
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
        
        {!loading && movies.length === 0 && (
          <div className="text-center py-20 bg-surface-light rounded-2xl border border-white/5">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No movies found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
