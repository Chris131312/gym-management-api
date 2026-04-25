import React, { useState, useEffect, useRef } from "react";
import { ScanLine, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function CheckInScanner() {
  const [inputValue, setInputValue] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);
}

export default CheckInScanner;
