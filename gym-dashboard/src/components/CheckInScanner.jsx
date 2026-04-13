import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function CheckInScanner() {
  const [memberID, setMemberId] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  const fetchCheckins = async () => {
    setIsLoadingCheckins(true);
    try {
      const response = await fetch("http://localhost:3000/api/checkins");
      const data = await response.json();
      if (response.ok) {
        setRecentCheckins(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching checkins:", error);
    } finally {
      setIsLoadingCheckins(false);
    }
  };
}
