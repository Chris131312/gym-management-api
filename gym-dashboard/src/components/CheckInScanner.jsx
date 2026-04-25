import React, { useState, useEffect, useRef } from "react";
import { ScanLine, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function CheckInScanner() {
  const [inputValue, setInputValue] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    const enforceFocus = () => {
      if (scanStatus === "idle" && inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener("click", enforceFocus);
    enforceFocus();

    return () => document.removeEventListener("click", enforceFocus);
  }, [scanStatus]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const scannedId = inputValue.trim();
    setInputValue("");

    try {
      const res = await fetch("http://localhost:3000/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: scannedId }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanStatus("success");
        setMessage(data.message || "Access Granted");
        toast.success("Check-in successful");
      } else {
        scanStatus(error);
        setMessage(data.error || "Access Denied");
        toast.error("Check-in failed");
      }
    } catch (error) {
      setScanStatus("error");
      setMessage("Server Connection Error");
      toast.error("System offline");
    }

    setTimeout(() => {
      setScanStatus("idle");
      setMessage("");
    }, 3000);
  };
  return (
    <div className="h-full w-full flex items-center justify-center p-8 animate-fade-in">
      <form onSubmit={handleScan} className="absolute opacity-0">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <button type="submit">Scan</button>
      </form>

      {scanStatus === "idle" && (
        <div className="text-center max-w-lg w-full bg-white p-12 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center">
          <div className="bg-blue-50 p-8 rounded-full mb-8 animate-pulse">
            <ScanLine className="w-24 h-24 text-blue-500" />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Ready to Scan
          </h2>
          <p className="text-gray-500 text-lg">
            Please scan your membership card or enter your ID code.
          </p>
        </div>
      )}

      {scanStatus === "success" && (
        <div className="text-center max-w-lg w-full bg-green-500 p-12 rounded-3xl shadow-2xl flex flex-col items-center animate-pop-in">
          <CheckCircle className="w-32 h-32 text-white mb-8" />
          <h2 className="text-5xl font-bold text-white mb-4">GRANTED</h2>
          <p className="text-green-100 text-xl font-medium">{message}</p>
        </div>
      )}

      {scanStatus === "error" && (
        <div className="text-center max-w-lg w-full bg-red-500 p-12 rounded-3xl shadow-2xl flex flex-col items-center animate-pop-in">
          <XCircle className="w-32 h-32 text-white mb-8" />
          <h2 className="text-5xl font-bold text-white mb-4">DENIED</h2>
          <p className="text-red-100 text-xl font-medium">{message}</p>
          <div className="mt-8 flex items-center gap-2 text-white bg-red-600 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>Please visit the front desk</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckInScanner;
