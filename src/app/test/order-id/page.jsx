"use client";

import { useState, useEffect } from "react";
import {
    generateOrderId,
    generatePaddleOrderId,
    generateBallOrderId,
    generateCourtOrderId,
    parseOrderId,
    isValidOrderId,
} from "@/utils/orderIdGenerator";

/**
 * Test component for order ID generator utilities
 * Tests generation, parsing, and validation
 */
export default function TestOrderIdGenerator() {
    const [generatedIds, setGeneratedIds] = useState([]);
    const [customPrefix, setCustomPrefix] = useState("BST");
    const [testId, setTestId] = useState("");
    const [parseResult, setParseResult] = useState(null);
    const [validationResult, setValidationResult] = useState(null);

    const generateMultiple = (generator, label, count = 5) => {
        const ids = [];
        for (let i = 0; i < count; i++) {
            ids.push({
                id: generator(),
                label,
                timestamp: new Date().toLocaleTimeString(),
            });
        }
        setGeneratedIds((prev) => [...ids, ...prev]);
    };

    const handleParseId = () => {
        if (!testId) return;
        const result = parseOrderId(testId);
        setParseResult(result);
    };

    const handleValidateId = () => {
        if (!testId) return;
        const isValid = isValidOrderId(testId);
        setValidationResult(isValid);
    };

    useEffect(() => {
        if (testId) {
            handleParseId();
            handleValidateId();
        } else {
            setParseResult(null);
            setValidationResult(null);
        }
    }, [testId]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🧪 Order ID Generator Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Generation */}
                    <div className="space-y-6">
                        {/* Quick Generate */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Quick Generate
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => generateMultiple(generatePaddleOrderId, "Paddle", 1)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Generate Paddle ID
                                </button>
                                <button
                                    onClick={() => generateMultiple(generateBallOrderId, "Ball", 1)}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                >
                                    Generate Ball ID
                                </button>
                                <button
                                    onClick={() => generateMultiple(generateCourtOrderId, "Court", 1)}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                >
                                    Generate Court ID
                                </button>
                            </div>
                        </div>

                        {/* Custom Prefix */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Custom Prefix
                            </h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={customPrefix}
                                    onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter prefix (e.g., BST, TEST)"
                                />
                                <button
                                    onClick={() =>
                                        generateMultiple(() => generateOrderId(customPrefix), `Custom (${customPrefix})`, 1)
                                    }
                                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                                >
                                    Generate with Custom Prefix
                                </button>
                            </div>
                        </div>

                        {/* Batch Generate */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Batch Generate
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => generateMultiple(generatePaddleOrderId, "Paddle", 10)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                                >
                                    10 Paddle IDs
                                </button>
                                <button
                                    onClick={() => generateMultiple(generateBallOrderId, "Ball", 10)}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                                >
                                    10 Ball IDs
                                </button>
                                <button
                                    onClick={() => generateMultiple(generateCourtOrderId, "Court", 10)}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
                                >
                                    10 Court IDs
                                </button>
                                <button
                                    onClick={() => setGeneratedIds([])}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Format Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                Format Information
                            </h3>
                            <div className="space-y-2 text-sm text-blue-700">
                                <p>
                                    <span className="font-medium">Paddle/Ball:</span>{" "}
                                    <code className="bg-blue-100 px-2 py-1 rounded">
                                        BST-YYMMDD-XXX
                                    </code>
                                </p>
                                <p>
                                    <span className="font-medium">Court:</span>{" "}
                                    <code className="bg-blue-100 px-2 py-1 rounded">
                                        BST-CC-YYMMDD-XXX
                                    </code>
                                </p>
                                <p className="text-xs mt-2">
                                    YY = Year, MM = Month, DD = Day, XXX = Random 3-char code
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Parse & Validate */}
                    <div className="space-y-6">
                        {/* Parse & Validate */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Parse & Validate
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Enter Order ID to Test:
                                    </label>
                                    <input
                                        type="text"
                                        value={testId}
                                        onChange={(e) => setTestId(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., BST-251208-A3F"
                                    />
                                </div>

                                {/* Validation Result */}
                                {testId && (
                                    <div
                                        className={`p-4 rounded-lg ${validationResult
                                                ? "bg-green-50 border border-green-200"
                                                : "bg-red-50 border border-red-200"
                                            }`}
                                    >
                                        <p
                                            className={`font-medium ${validationResult ? "text-green-800" : "text-red-800"
                                                }`}
                                        >
                                            {validationResult ? "✅ Valid Order ID" : "❌ Invalid Order ID"}
                                        </p>
                                    </div>
                                )}

                                {/* Parse Result */}
                                {parseResult && testId && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-700 mb-3">
                                            Parsed Components:
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Prefix:</span>
                                                <code className="bg-white px-2 py-1 rounded border">
                                                    {parseResult.prefix || "N/A"}
                                                </code>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <code className="bg-white px-2 py-1 rounded border">
                                                    {parseResult.date || "N/A"}
                                                </code>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Random:</span>
                                                <code className="bg-white px-2 py-1 rounded border">
                                                    {parseResult.random || "N/A"}
                                                </code>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date Object:</span>
                                                <code className="bg-white px-2 py-1 rounded border">
                                                    {parseResult.dateObject
                                                        ? parseResult.dateObject.toLocaleDateString()
                                                        : "N/A"}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Generated IDs List */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Generated IDs ({generatedIds.length})
                                </h2>
                                {generatedIds.length > 0 && (
                                    <button
                                        onClick={() => {
                                            const ids = generatedIds.map((item) => item.id).join("\n");
                                            navigator.clipboard.writeText(ids);
                                            alert("IDs copied to clipboard!");
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Copy All
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {generatedIds.length === 0 ? (
                                    <p className="text-gray-400 text-sm">
                                        No IDs generated yet...
                                    </p>
                                ) : (
                                    generatedIds.map((item, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                            onClick={() => setTestId(item.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <code className="text-sm font-mono text-gray-800">
                                                        {item.id}
                                                    </code>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.label} • {item.timestamp}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(item.id);
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Uniqueness Test */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Uniqueness Test
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Generated:</span>
                                    <span className="font-medium">{generatedIds.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unique IDs:</span>
                                    <span className="font-medium">
                                        {new Set(generatedIds.map((item) => item.id)).size}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duplicates:</span>
                                    <span
                                        className={`font-medium ${generatedIds.length -
                                                new Set(generatedIds.map((item) => item.id)).size ===
                                                0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {generatedIds.length -
                                            new Set(generatedIds.map((item) => item.id)).size}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        📝 Testing Instructions
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                        <li>Generate IDs using quick generate buttons</li>
                        <li>Try custom prefix generation</li>
                        <li>Generate batch IDs to test uniqueness</li>
                        <li>Click on any generated ID to parse and validate it</li>
                        <li>Enter custom IDs in the input to test parsing</li>
                        <li>Verify date parsing is correct</li>
                        <li>Check uniqueness test shows 0 duplicates</li>
                        <li>Test invalid IDs to see validation fail</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
