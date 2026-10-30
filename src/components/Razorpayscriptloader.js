"use client";

import { useEffect } from "react";

const RazorpayScriptLoader = () => {
  useEffect(() => {
    // Ensure the script is added only on the client side
    if (typeof window !== "undefined") {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        // Optional: Cleanup the script if needed
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default RazorpayScriptLoader;
