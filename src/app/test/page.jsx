"use client";

import Link from "next/link";

/**
 * Test utilities index page
 * Links to all utility test pages
 */
export default function TestUtilities() {
    const tests = [
        {
            title: "Currency Conversion",
            description: "Test the useCurrencyConversion hook with different price points",
            path: "/test/currency",
            icon: "💱",
            color: "blue",
        },
        {
            title: "Image Upload",
            description: "Test image upload, finalize, and delete operations",
            path: "/test/image-upload",
            icon: "📸",
            color: "green",
        },
        {
            title: "Order ID Generator",
            description: "Test order ID generation, parsing, and validation",
            path: "/test/order-id",
            icon: "🔢",
            color: "purple",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        🧪 Utility Testing Suite
                    </h1>
                    <p className="text-xl text-gray-600">
                        Test all shared utilities before migrating forms
                    </p>
                </div>

                {/* Test Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {tests.map((test) => (
                        <Link
                            key={test.path}
                            href={test.path}
                            className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-${test.color}-500`}
                        >
                            <div className="text-6xl mb-4">{test.icon}</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                {test.title}
                            </h2>
                            <p className="text-gray-600">{test.description}</p>
                            <div className="mt-6 flex items-center text-blue-600 font-medium">
                                <span>Start Testing</span>
                                <svg
                                    className="w-5 h-5 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        📋 Testing Instructions
                    </h2>

                    <div className="space-y-6">
                        {/* Currency Conversion */}
                        <div>
                            <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                💱 Currency Conversion Test
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li>Test with different price points (Paddle, Ball, Court)</li>
                                <li>Verify currency symbol matches your location</li>
                                <li>Check GST calculation (18% of base price)</li>
                                <li>Verify conversion rate is reasonable</li>
                                <li>Test with custom prices</li>
                            </ul>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <h3 className="text-lg font-semibold text-green-600 mb-2">
                                📸 Image Upload Test
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li>Upload images to temp storage</li>
                                <li>Finalize upload (move to final storage)</li>
                                <li>Test delete operations</li>
                                <li>Try different file formats (JPG, PNG, PDF)</li>
                                <li>Verify files in Firebase Storage console</li>
                            </ul>
                        </div>

                        {/* Order ID */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-600 mb-2">
                                🔢 Order ID Generator Test
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li>Generate IDs for different form types</li>
                                <li>Test custom prefix generation</li>
                                <li>Verify uniqueness with batch generation</li>
                                <li>Test parsing of generated IDs</li>
                                <li>Validate ID format</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Status Checklist */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mt-8 text-white">
                    <h2 className="text-2xl font-bold mb-6">✅ Testing Checklist</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg mb-3">Currency Conversion:</h3>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Test with Paddle prices</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Test with Ball prices</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Test with Court prices</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Verify GST calculation</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg mb-3">Image Upload:</h3>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Upload to temp storage</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Finalize upload</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Delete file</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Test different formats</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg mb-3">Order ID:</h3>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Generate Paddle IDs</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Generate Ball IDs</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Generate Court IDs</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Verify uniqueness</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg mb-3">General:</h3>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>No console errors</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>All functions work</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Error handling works</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" />
                                <span>Ready for migration</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 mt-8">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">
                        🚀 After Testing
                    </h2>
                    <p className="text-green-700 mb-4">
                        Once all tests pass, you're ready to migrate the forms!
                    </p>
                    <div className="space-y-2 text-green-700">
                        <p>✅ All utilities tested and working</p>
                        <p>✅ No console errors</p>
                        <p>✅ Logic matches current implementation</p>
                        <p>✅ Ready to migrate Paddle, Ball, and Court forms</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
