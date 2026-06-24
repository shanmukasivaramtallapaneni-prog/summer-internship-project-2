import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout, {
  AdminRoute,
  ProtectedRoute,
} from "./components/Layout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RegisterPage from "./pages/RegisterPage";
import TicketPage from "./pages/TicketPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#e94560',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="movies/:id" element={<MovieDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="ticket/:id" element={<TicketPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
