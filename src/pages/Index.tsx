
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
      console.log("Index: Redirecting to dashboard with default parameters");
      navigate("/dashboard", { replace: true });
    } else {
      // Log the parameters for debugging
      console.log("Index: Redirecting to dashboard with parameters:", params.toString());
      
      // Check if years_back is one of the parameters and ensure it's valid
      if (params.has("years_back")) {
        const yb = params.get("years_back");
        // If not a number or "max", set to default
        if (yb !== "max" && isNaN(Number(yb))) {
          console.log("Index: Invalid years_back parameter, using default");
          params.set("years_back", "15");
        }
      }
      
      // Redirect with the existing parameters
      navigate(`/dashboard?${params.toString()}`, { replace: true });
    }
  }, [navigate, location.search]);

  return null; // We're redirecting, so no need to render anything
};

export default Index;
