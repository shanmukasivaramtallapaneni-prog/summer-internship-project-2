import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-primary font-medium"
    : "text-gray-300 hover:text-white transition-colors";
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-white/10 bg-surface-light/80 backdrop-blur sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">
          CineBook
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <NavLink to="/" end className={navClass}>
            Movies
          </NavLink>

          {user ? (
            <>
              <NavLink to="/my-bookings" className={navClass}>
                My Bookings
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              )}
              <span className="text-gray-400 hidden sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
