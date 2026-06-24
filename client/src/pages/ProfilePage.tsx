import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../services/api";
import type { Booking } from "../types";
import { User, Ticket, Calendar, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getMyBookings(token)
      .then(data => setBookings(data.bookings))
      .catch(err => toast.error(err instanceof ApiError ? err.message : "Failed to load stats"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        <User className="text-primary w-8 h-8" />
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-surface-light border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-center text-white">{user.name}</h2>
          <p className="text-center text-gray-400 mb-6">{user.email}</p>
          
          <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Account Type</span>
              <span className="font-bold text-primary">{user.role}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Member Since</span>
              <span className="font-medium text-white">2026</span>
            </div>
          </div>

          <button className="w-full mt-6 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg transition-colors text-sm">
            <Settings className="w-4 h-4" /> Account Settings
          </button>
        </div>

        {/* Stats Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-surface border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-black text-white">{loading ? "-" : bookings.length}</p>
              </div>
            </div>

            <div className="bg-surface border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Upcoming Shows</p>
                <p className="text-3xl font-black text-white">
                  {loading ? "-" : bookings.filter(b => b.status !== "CANCELLED" && new Date(b.showtime.startTime) > new Date()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-light border border-white/10 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-white/5 rounded"></div>
                <div className="h-12 bg-white/5 rounded"></div>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                    <div>
                      <p className="font-bold text-white">{b.showtime.movie.title}</p>
                      <p className="text-xs text-gray-400">{new Date(b.showtime.startTime).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No activity found yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
