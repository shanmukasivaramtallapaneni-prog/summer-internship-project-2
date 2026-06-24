import { useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Booking, Movie } from "../types";
import { ShieldCheck, Film, Ticket, TrendingUp, DollarSign, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "movies" | "bookings">("analytics");
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalBookings: 0, topMovie: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.getMovies().then(d => setMovies(d.movies)),
      api.getAllBookings(token).then(d => setBookings(d.bookings)),
      api.getAnalytics(token).then(d => setAnalytics(d.analytics))
    ])
    .catch(err => toast.error(err instanceof ApiError ? err.message : "Failed to load admin data"))
    .finally(() => setLoading(false));

  }, [token]);

  const handleDeleteMovie = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this movie?")) return;
    try {
      await api.deleteMovie(id, token);
      setMovies(movies.filter((m) => m.id !== id));
      toast.success("Movie deleted successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete movie");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your cinema operations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        {[
          { id: "analytics", label: "Analytics", icon: Activity },
          { id: "movies", label: "Manage Movies", icon: Film },
          { id: "bookings", label: "All Bookings", icon: Ticket }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(233,69,96,0.2)]" 
                : "bg-surface text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading dashboard data...</div>
      ) : (
        <>
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-surface-light border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm">Total Revenue</h3>
                  <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                </div>
                <p className="text-4xl font-black text-white">₹{analytics.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-surface-light border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm">Total Bookings</h3>
                  <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Ticket className="w-5 h-5" /></div>
                </div>
                <p className="text-4xl font-black text-white">{analytics.totalBookings}</p>
              </div>

              <div className="bg-surface-light border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm">Top Movie</h3>
                  <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-2xl font-black text-white truncate" title={analytics.topMovie}>{analytics.topMovie}</p>
              </div>
            </div>
          )}

          {/* Movies Tab */}
          {activeTab === "movies" && (
            <div className="bg-surface-light border border-white/5 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Movie</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movies.map(m => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden">
                            <img src={m.posterUrl || "https://placehold.co/400x600/1a1a2e/e94560?text=No+Poster"} alt={m.title} className="w-full h-full object-cover" />
                          </div>
                          {m.title}
                        </td>
                        <td className="p-4 text-gray-300">{m.genre}</td>
                        <td className="p-4 text-gray-300">{m.durationMinutes} min</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:text-red-300 font-bold text-sm bg-red-400/10 px-3 py-1 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-surface-light border border-white/5 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Movie</th>
                      <th className="p-4">Seats</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white">{(b as any).user?.email || "Unknown"}</td>
                        <td className="p-4 font-bold text-gray-300">{b.showtime.movie.title}</td>
                        <td className="p-4 text-gray-400">{b.seats.length} seats</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
