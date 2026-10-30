import { useState, useEffect } from "react";

/**
 * Custom hook for currency conversion based on user's location
 * Fetches user's country and converts INR prices to local currency
 * 
 * @param {number} basePriceINR - The base price in Indian Rupees
 * @returns {Object} Currency conversion data
 * @returns {number} convertedPrice - Price converted to user's currency
 * @returns {string} currencySymbol - Currency symbol (e.g., ₹, $, €)
 * @returns {string} currencyCode - Currency code (e.g., INR, USD, EUR)
 * @returns {string} userCountry - User's country code (e.g., IN, US)
 * @returns {boolean} isLoading - Loading state
 * @returns {string} error - Error message if any
 */
export const useCurrencyConversion = (basePriceINR) => {
    const [convertedPrice, setConvertedPrice] = useState(0);
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [currencyCode, setCurrencyCode] = useState("INR");
    const [userCountry, setUserCountry] = useState("IN");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserLocationAndRates = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Try multiple geolocation APIs with fallback
                let locationData = null;

                // Try ipapi.com first (free tier, CORS-friendly)
                try {
                    const response = await fetch("https://ipapi.com/ip_api.php?ip=check");
                    if (response.ok) {
                        locationData = await response.json();
                        setUserCountry(locationData.country_code || "IN");
                    }
                } catch (e) {

                }

                // Fallback: Use browser timezone to guess country
                if (!locationData) {
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    // Simple timezone to country mapping
                    if (timezone.includes("America")) {
                        setUserCountry("US");
                    } else if (timezone.includes("Europe")) {
                        setUserCountry("GB");
                    } else if (timezone.includes("Asia/Kolkata") || timezone.includes("Asia/Calcutta")) {
                        setUserCountry("IN");
                    } else {
                        setUserCountry("IN"); // Default to India
                    }
                }

                const currencyCodeFromLocation = locationData?.currency || "INR";

                // Fetch exchange rates from INR
                const ratesResponse = await fetch(
                    `https://api.exchangerate-api.com/v4/latest/INR`
                );
                const ratesData = await ratesResponse.json();

                // Convert price to user's currency
                const conversionRate = ratesData.rates[currencyCodeFromLocation] || 1;
                const convertedAmount = (basePriceINR * conversionRate).toFixed(2);
                setConvertedPrice(convertedAmount);

                // Set currency code
                setCurrencyCode(currencyCodeFromLocation);

                // Get currency symbol using Intl.NumberFormat
                const symbol = new Intl.NumberFormat("en", {
                    style: "currency",
                    currency: currencyCodeFromLocation,
                })
                    .format(0)
                    .charAt(0);

                setCurrencySymbol(symbol);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching location or exchange rates:", err);
                setError(err.message);

                // Fallback to INR if there's an error
                setConvertedPrice(basePriceINR);
                setCurrencySymbol("₹");
                setCurrencyCode("INR");
                setUserCountry("IN");
                setIsLoading(false);
            }
        };

        if (basePriceINR && basePriceINR > 0) {
            fetchUserLocationAndRates();
        }
    }, [basePriceINR]);

    return {
        convertedPrice: Number(convertedPrice),
        currencySymbol,
        currencyCode,
        userCountry,
        isLoading,
        error,
    };
};
