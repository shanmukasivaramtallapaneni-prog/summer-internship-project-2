import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../services/api";
import type { Booking } from "../types";
import { Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !token) return;

    api
      .getBooking(id, token)
      .then((data) => {
        setBooking(data.booking);
        // Simulate email confirmation sent
        setTimeout(() => {
          toast.success("Email confirmation sent to your inbox!", {
            duration: 4000,
            icon: '📧',
          });
        }, 1000);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load ticket")
      )
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    const toastId = toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#1a1a2e"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a5");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CineBook_Ticket_${id}.pdf`);
      
      toast.success("Ticket downloaded successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto py-20 px-4 flex flex-col items-center animate-pulse">
      <div className="w-64 h-8 bg-white/10 rounded-full mb-12"></div>
      <div className="w-full max-w-2xl h-80 bg-surface-light rounded-2xl border border-white/5"></div>
    </div>
  );
  
  if (!booking) return <div className="text-center py-20 text-red-400">Ticket not found</div>;

  const date = new Date(booking.showtime.startTime);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <div className="mb-8 text-center animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-8 h-8" />
          Booking Confirmed!
        </h1>
        <p className="text-gray-400">Your digital ticket is ready.</p>
      </div>

      {/* Ticket UI - Wrapper for PDF export */}
      <div className="w-full max-w-2xl relative shadow-2xl" ref={ticketRef}>
        <div className="w-full bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row text-gray-900 border-4 border-white">
          {/* Left Side (Movie Info) */}
          <div className="p-8 flex-1 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 to-gray-200">
            <div className="uppercase tracking-widest text-xs font-bold text-gray-500 mb-6 flex justify-between">
              <span>CineBook Ticket</span>
              <span className="text-primary">{booking.status}</span>
            </div>
            
            <h2 className="text-3xl font-black mb-1 text-gray-900 leading-tight truncate pr-4">
              {booking.showtime.movie.title}
            </h2>
            <p className="text-gray-600 mb-8 font-medium">
              {booking.showtime.theater.name} • {booking.showtime.theater.location}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-1">Date</p>
                <p className="font-bold text-lg">{date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-1">Time</p>
                <p className="font-bold text-lg">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500 font-bold mb-1">Seats</p>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((seat, i) => (
                  <span key={i} className="bg-gray-800 text-white px-3 py-1 rounded font-mono font-bold text-sm">
                    {seat.row}{seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="hidden sm:flex flex-col items-center justify-center bg-gray-100 relative w-8">
            <div className="absolute top-0 w-8 h-8 bg-[#1a1a2e] rounded-full -translate-y-1/2"></div>
            <div className="h-full border-l-2 border-dashed border-gray-300"></div>
            <div className="absolute bottom-0 w-8 h-8 bg-[#1a1a2e] rounded-full translate-y-1/2"></div>
          </div>

          {/* Right Side (QR) */}
          <div className="bg-gray-100 p-8 flex flex-col items-center justify-center border-t-2 border-dashed border-gray-300 sm:border-none w-full sm:w-64 shrink-0">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`} 
              alt="Ticket QR Code" 
              className="w-32 h-32 mb-4 mix-blend-multiply"
            />
            <p className="font-mono text-xs text-gray-500 text-center break-all">
              {booking.id.toUpperCase()}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">Admit {booking.seats.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20"
        >
          <Download className="w-5 h-5" /> Download PDF
        </button>
        <Link
          to="/my-bookings"
          className="bg-surface hover:bg-gray-800 border border-white/10 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          View All Bookings
        </Link>
        <Link
          to="/"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
