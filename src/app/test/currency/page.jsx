"use client";

import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useState } from "react";

/**
 * Test component for useCurrencyConversion hook
 * Tests currency conversion with different price points
 */
export default function TestCurrencyConversion() {
    const [testPrice, setTestPrice] = useState(51000);

    const {
        convertedPrice,
        currencySymbol,
        currencyCode,
        userCountry,
        isLoading,
        error,
    } = useCurrencyConversion(testPrice);

    const testPrices = [
        { label: "Paddle (New)", value: 51000 },
        { label: "Paddle (Resubmission)", value: 21000 },
        { label: "Paddle (Renewal)", value: 12000 },
        { label: "Ball (New)", value: 21000 },
        { label: "Ball (Resubmission)", value: 12000 },
        { label: "Court (2 courts)", value: 25000 },
        { label: "Court (5 courts)", value: 55000 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🧪 Currency Conversion Test
                </h1>

                {/* Test Price Selector */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Select Test Price
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {testPrices.map((price) => (
                            <button
                                key={price.label}
                                onClick={() => setTestPrice(price.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${testPrice === price.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                {price.label}
                                <br />
                                <span className="text-sm">₹{price.value.toLocaleString()}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Price Input */}
                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Or Enter Custom Price (INR):
                        </label>
                        <input
                            type="number"
                            value={testPrice}
                            onChange={(e) => setTestPrice(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter price in INR"
                        />
                    </div>
                </div>

                {/* Results Display */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Conversion Results
                    </h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="ml-4 text-gray-600">Loading conversion data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium">❌ Error:</p>
                            <p className="text-red-600">{error}</p>
                            <p className="text-sm text-red-500 mt-2">
                                Falling back to INR (₹{testPrice.toLocaleString()})
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Price Display */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <p className="text-sm text-gray-600 mb-2">Converted Price:</p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {currencySymbol} {Number(convertedPrice).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Base Price: ₹{testPrice.toLocaleString()} INR
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Currency Symbol</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {currencySymbol}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Currency Code</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {currencyCode}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Your Country</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {userCountry}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {testPrice > 0
                                            ? (Number(convertedPrice) / testPrice).toFixed(4)
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* With GST */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Total with 18% GST:
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {currencySymbol}{" "}
                                    {(Number(convertedPrice) * 1.18).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    GST Amount: {currencySymbol}{" "}
                                    {(Number(convertedPrice) * 0.18).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Test Status
                    </h2>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span
                                className={`w-3 h-3 rounded-full mr-3 ${!isLoading ? "bg-green-500" : "bg-yellow-500"
                                    }`}
                            ></span>
                            <span className="text-gray-700">
                                {!isLoading ? "✅ Data Loaded" : "⏳ Loading..."}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span
                                className={`w-3 h-3 rounded-full mr-3 ${!error ? "bg-green-500" : "bg-red-500"
                                    }`}
                            ></span>
                            <span className="text-gray-700">
                                {!error ? "✅ No Errors" : "❌ Error Occurred"}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span
                                className={`w-3 h-3 rounded-full mr-3 ${convertedPrice > 0 ? "bg-green-500" : "bg-gray-300"
                                    }`}
                            ></span>
                            <span className="text-gray-700">
                                {convertedPrice > 0
                                    ? "✅ Conversion Successful"
                                    : "⏳ Waiting for conversion"}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span
                                className={`w-3 h-3 rounded-full mr-3 ${currencySymbol && currencyCode
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            ></span>
                            <span className="text-gray-700">
                                {currencySymbol && currencyCode
                                    ? "✅ Currency Data Retrieved"
                                    : "⏳ Waiting for currency data"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        📝 Testing Instructions
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                        <li>Select different test prices or enter a custom amount</li>
                        <li>Verify the conversion happens automatically</li>
                        <li>Check that currency symbol matches your location</li>
                        <li>Verify GST calculation (18% of base price)</li>
                        <li>Test with different price points</li>
                        <li>
                            If you're in India, currency should be INR (₹) with 1:1 conversion
                        </li>
                        <li>
                            If you're outside India, you should see your local currency
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
