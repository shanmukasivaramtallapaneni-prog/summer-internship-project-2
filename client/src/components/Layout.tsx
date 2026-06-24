import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Film, User, LogOut, ShieldCheck, Ticket } from "lucide-react";
import Footer from "../components/Footer";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Film className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
              Cine<span className="text-primary">Book</span>
            </h1>
          </Link>
          
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center gap-1.5 font-bold text-sm transition-colors ${isActive('/admin') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link 
                  to="/my-bookings" 
                  className={`flex items-center gap-1.5 font-bold text-sm transition-colors ${isActive('/my-bookings') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  <Ticket className="w-4 h-4" /> Bookings
                </Link>
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-1.5 font-bold text-sm transition-colors ${isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-bold transition-transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
