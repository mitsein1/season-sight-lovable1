
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard with default parameters
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null; // We're redirecting, so no need to render anything
};

export default Index;
