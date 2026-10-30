/**
 * Generate a unique order ID with timestamp and random component
 * 
 * Format: PREFIX-YYMMDD-XXX
 * - PREFIX: Custom prefix (e.g., "BST", "BST-CC")
 * - YYMMDD: Year, Month, Day
 * - XXX: Random 3-character alphanumeric string
 * 
 * @param {string} prefix - The prefix for the order ID (default: "BST")
 * @returns {string} Generated order ID
 * 
 * @example
 * generateOrderId("BST") // Returns: "BST-251208-A3F"
 * generateOrderId("BST-CC") // Returns: "BST-CC-251208-B7K"
 */
export const generateOrderId = (prefix = "BST") => {
    const now = new Date();

    // Get year (last 2 digits)
    const year = now.getFullYear().toString().slice(-2);

    // Get month (01-12)
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Get day (01-31)
    const day = String(now.getDate()).padStart(2, "0");

    // Generate random 3-character alphanumeric string
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();

    // Combine all parts
    return `${prefix}-${year}${month}${day}-${randomPart}`;
};

/**
 * Generate order ID for Paddle testing
 * @returns {string} Order ID with "BST" prefix
 */
export const 
generatePaddleOrderId = () => {
    return generateOrderId("BST");
};

/**
 * Generate order ID for Ball testing
 * @returns {string} Order ID with "BST" prefix
 */
export const generateBallOrderId = () => {
    return generateOrderId("BST");
};

/**
 * Generate order ID for Court certification
 * @returns {string} Order ID with "BST-CC" prefix
 */
export const generateCourtOrderId = () => {
    return generateOrderId("BST-CC");
};

/**
 * Generate order ID for Sports Flooring certification
 * @returns {string} Order ID with "BST-SF" prefix
 */
export const generateFlooringOrderId = () => {
    return generateOrderId("BST-SF");
};

/**
 * Parse an order ID to extract its components
 * 
 * @param {string} orderId - The order ID to parse
 * @returns {Object} Parsed components
 * @returns {string} prefix - The prefix part
 * @returns {string} date - The date part (YYMMDD)
 * @returns {string} random - The random part
 * @returns {Date|null} dateObject - Parsed date object (or null if invalid)
 * 
 * @example
 * parseOrderId("BST-251208-A3F")
 * // Returns: {
 * //   prefix: "BST",
 * //   date: "251208",
 * //   random: "A3F",
 * //   dateObject: Date object for 2025-12-08
 * // }
 */
export const parseOrderId = (orderId) => {
    try {
        const parts = orderId.split("-");

        if (parts.length < 3) {
            throw new Error("Invalid order ID format");
        }

        // Handle both "BST-YYMMDD-XXX" and "BST-CC-YYMMDD-XXX" formats
        let prefix, date, random;

        if (parts.length === 3) {
            // Format: BST-YYMMDD-XXX
            [prefix, date, random] = parts;
        } else if (parts.length === 4) {
            // Format: BST-CC-YYMMDD-XXX
            prefix = `${parts[0]}-${parts[1]}`;
            date = parts[2];
            random = parts[3];
        } else {
            throw new Error("Invalid order ID format");
        }

        // Parse date
        let dateObject = null;
        if (date && date.length === 6) {
            const year = 2000 + parseInt(date.substring(0, 2));
            const month = parseInt(date.substring(2, 4)) - 1; // Month is 0-indexed
            const day = parseInt(date.substring(4, 6));
            dateObject = new Date(year, month, day);
        }

        return {
            prefix,
            date,
            random,
            dateObject,
        };
    } catch (error) {
        console.error("Error parsing order ID:", error);
        return {
            prefix: null,
            date: null,
            random: null,
            dateObject: null,
        };
    }
};

/**
 * Validate if a string is a valid order ID
 * 
 * @param {string} orderId - The order ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidOrderId = (orderId) => {
    if (!orderId || typeof orderId !== "string") {
        return false;
    }

    // Check format: PREFIX-YYMMDD-XXX or PREFIX-CC-YYMMDD-XXX
    const pattern = /^[A-Z]+-([A-Z]+-)?[0-9]{6}-[A-Z0-9]{3}$/;
    return pattern.test(orderId);
};
