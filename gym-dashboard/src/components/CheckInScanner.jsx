import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import { ScanLine, Check, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const RESET_DELAY = 3000;

function CheckInScanner() {
  const [inputValue, setInputValue] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (scanStatus === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanStatus]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const scannedId = inputValue.trim();
    setInputValue("");

    try {
      const data = await api.post("/checkins", { member_id: scannedId });
      setScanStatus("success");
      setMessage(data.message || "Access Granted");
      toast.success("Check-in successful");
    } catch (error) {
      setScanStatus("error");
      setMessage(error.message || "Access Denied");
      toast.error("Check-in failed");
    }

    setTimeout(() => {
      setScanStatus("idle");
      setMessage("");
    }, RESET_DELAY);
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      {/* Idle State */}
      {scanStatus === "idle" && (
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-6">
              <ScanLine className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Check-in Scanner
            </h2>
            <p className="text-gray-400 text-sm">
              Scan a membership card or enter an ID manually.
            </p>
          </div>

          <form onSubmit={handleScan} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter Member ID..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-center bg-white border border-gray-200 rounded-xl px-4 py-4 text-lg font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Verify Access
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-6">
            The scanner resets automatically after each check-in.
          </p>
        </div>
      )}

      {/* Success State */}
      {scanStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-800">
            <div
              className="h-full bg-white/40 rounded-r-full"
              style={{
                animation: `shrink ${RESET_DELAY}ms linear forwards`,
              }}
            />
          </div>

          <div className="text-center px-6">
            <div className="inline-flex p-5 bg-white/10 rounded-full mb-8 backdrop-blur-sm">
              <Check className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
              ACCESS GRANTED
            </h2>
            <p className="text-emerald-200 text-lg font-medium max-w-sm mx-auto">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {scanStatus === "error" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-900">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-800">
            <div
              className="h-full bg-white/40 rounded-r-full"
              style={{
                animation: `shrink ${RESET_DELAY}ms linear forwards`,
              }}
            />
          </div>

          <div className="text-center px-6">
            <div className="inline-flex p-5 bg-white/10 rounded-full mb-8 backdrop-blur-sm">
              <X className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
              ACCESS DENIED
            </h2>
            <p className="text-red-200 text-lg font-medium max-w-sm mx-auto mb-8">
              {message}
            </p>
            <div className="inline-flex items-center gap-2 text-white/70 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm text-sm">
              <AlertCircle className="w-4 h-4" />
              Please visit the front desk
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default CheckInScanner;
