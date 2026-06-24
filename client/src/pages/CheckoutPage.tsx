import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../services/api";

type PaymentMethod = "UPI" | "CARD" | "NET_BANKING" | "WALLET";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const state = location.state as {
    showtimeId?: string;
    seatIds?: string[];
    movieTitle?: string;
    theaterName?: string;
    startTime?: string;
    price?: number;
  };
  
  const { showtimeId, seatIds, movieTitle, theaterName, startTime, price } = state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  useEffect(() => {
    if (!showtimeId || !seatIds || seatIds.length === 0) {
      navigate("/");
    }
  }, [showtimeId, seatIds, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setError("Payment timeout. Please try again.");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handlePayment = async () => {
    if (!token || !showtimeId || !seatIds) return;
    
    setLoading(true);
    setError(null);

    // Simulate 3s payment delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const response = await api.createBooking(
        { showtimeId, seatIds },
        token
      );
      setSuccess(true);
      
      // Briefly show success before redirect
      setTimeout(() => {
        navigate(`/ticket/${response.booking.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("moviebooking@upi");
    alert("UPI ID copied to clipboard!");
  };

  if (!showtimeId || !seatIds) return null;

  const totalAmount = (price || 15) * seatIds.length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      {/* Modals for Success/Failure */}
      {success && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface border border-primary/30 p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(233,69,96,0.2)] animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-green-500/50">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400">Generating your booking ticket...</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Booking Summary */}
        <div className="bg-surface-light border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>

          <h2 className="text-2xl font-black mb-6 text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-6 bg-primary inline-block rounded-sm"></span>
            Booking Summary
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Movie</p>
              <p className="text-xl font-bold text-white">{movieTitle || "Movie Title"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Theater</p>
                <p className="text-md font-medium text-gray-300">{theaterName || "Cinema"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Show Time</p>
                <p className="text-md font-medium text-gray-300">
                  {startTime ? new Date(startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short'}) : "TBD"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Selected Seats ({seatIds.length})</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {seatIds.map((_, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 px-3 py-1 rounded text-sm font-mono text-gray-300">
                    Seat {i+1}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Time Remaining</p>
                  <p className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-primary animate-pulse' : 'text-gray-300'}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment */}
        <div className="bg-surface border border-primary/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(233,69,96,0.05)]">
          <h2 className="text-2xl font-black mb-6 text-white tracking-wide uppercase flex items-center gap-2">
            Payment Options
          </h2>

          <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg border border-white/5">
            {["UPI", "CARD", "NET_BANKING", "WALLET"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as PaymentMethod)}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded transition-colors ${
                  paymentMethod === method 
                    ? "bg-primary text-white shadow-lg" 
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {method.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="min-h-[250px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 p-6 mb-6">
            {paymentMethod === "UPI" ? (
              <>
                <div className="bg-white p-3 rounded-xl mx-auto w-44 h-44 mb-4 flex items-center justify-center border-[6px] border-yellow-500/20 shadow-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=UPI://pay?pa=moviebooking@upi&pn=CineBook&am=${totalAmount.toFixed(2)}`} 
                    alt="UPI QR Code" 
                    className="w-full h-full"
                  />
                </div>
                <p className="text-gray-400 text-sm mb-2">Scan with any UPI App</p>
                <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg border border-white/10">
                  <span className="font-mono text-primary text-sm font-bold tracking-wider">moviebooking@upi</span>
                  <button onClick={copyUpiId} className="text-gray-400 hover:text-white p-1" title="Copy UPI ID">
                    📋
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <span className="text-4xl block mb-4">💳</span>
                <p>This is an academic project.</p>
                <p className="text-xs mt-2">Use a mock payment system. Please select UPI to view the demo QR code, or just click Pay Now.</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-primary/10 border border-primary/50 text-primary-light p-3 rounded-lg mb-6 text-sm text-center font-medium animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || timeLeft <= 0 || success}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 text-white py-4 rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(233,69,96,0.3)] hover:shadow-[0_0_30px_rgba(233,69,96,0.5)] transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                PAY ₹{totalAmount.toFixed(2)} NOW
              </span>
            )}
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          <p className="text-center text-xs text-gray-600 mt-4 font-medium uppercase tracking-wider">
            This is an academic project. Use a mock payment system with a demo UPI ID (moviebooking@upi) and a generated QR code. Do not integrate real payment gateways.
          </p>
        </div>
      </div>
    </div>
  );
}
