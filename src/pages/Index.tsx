import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Preserve any existing query parameters from the URL
    const params = new URLSearchParams(location.search);
    
    // If no parameters exist, use default parameters
    if (params.toString() === "") {
      navigate("/dashboard", { replace: true });
    } else {
      // Otherwise redirect with the existing parameters
      navigate(`/dashboard?${params.toString()}`, { replace: true });
    }
  }, [navigate, location.search]);

  return null; // We're redirecting, so no need to render anything
};

export default Index;
