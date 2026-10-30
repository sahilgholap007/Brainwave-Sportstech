"use client";

import { useState } from "react";
import {
    uploadImageToStorage,
    finalizeImageUpload,
    deleteImageFromStorage,
    deleteOldImageVersions,
} from "@/utils/imageUpload";
import { generatePaddleOrderId } from "@/utils/orderIdGenerator";
import Image from "next/image";

/**
 * Test component for image upload utilities
 * Tests upload, finalize, and delete operations
 */
export default function TestImageUpload() {
    const [testOrderId] = useState(generatePaddleOrderId());
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [finalUrl, setFinalUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [logs, setLogs] = useState([]);
    const [logCounter, setLogCounter] = useState(0);

    const addLog = (message, type = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        setLogCounter(prev => prev + 1);
        setLogs((prev) => [
            ...prev,
            { message, type, timestamp, id: `log-${logCounter}-${Date.now()}` },
        ]);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        addLog(`File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, "success");
    };

    const handleUploadToTemp = async () => {
        if (!selectedFile) {
            addLog("No file selected!", "error");
            return;
        }

        setIsUploading(true);
        addLog("Starting upload to temp storage...", "info");

        try {
            const result = await uploadImageToStorage(
                selectedFile,
                "testImages",
                testOrderId,
                "testImage",
                true // Upload to temp
            );

            if (result) {
                setUploadResult(result);
                addLog(`✅ Upload successful!`, "success");
                addLog(`Download URL: ${result.downloadURL}`, "info");
                addLog(`Filename: ${result.uniqueFileName}`, "info");
            } else {
                addLog("❌ Upload failed - no result returned", "error");
            }
        } catch (error) {
            addLog(`❌ Upload error: ${error.message}`, "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFinalize = async () => {
        if (!uploadResult) {
            addLog("No temp file to finalize!", "error");
            return;
        }

        setIsFinalizing(true);
        addLog("Moving file from temp to final storage...", "info");

        try {
            const finalURL = await finalizeImageUpload(
                uploadResult.uniqueFileName,
                "testImages"
            );

            if (finalURL) {
                setFinalUrl(finalURL);
                addLog(`✅ Finalization successful!`, "success");
                addLog(`Final URL: ${finalURL}`, "info");
            } else {
                addLog("❌ Finalization failed", "error");
            }
        } catch (error) {
            addLog(`❌ Finalization error: ${error.message}`, "error");
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleDelete = async () => {
        if (!uploadResult) {
            addLog("No file to delete!", "error");
            return;
        }

        setIsDeleting(true);
        addLog("Deleting file from storage...", "info");

        try {
            const success = await deleteImageFromStorage(
                finalUrl ? "testImages" : "tempUploads",
                uploadResult.uniqueFileName
            );

            if (success) {
                addLog(`✅ File deleted successfully!`, "success");
                setUploadResult(null);
                setFinalUrl(null);
            } else {
                addLog("❌ Delete failed", "error");
            }
        } catch (error) {
            addLog(`❌ Delete error: ${error.message}`, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteOldVersions = async () => {
        setIsDeleting(true);
        addLog("Deleting old file versions...", "info");

        try {
            await deleteOldImageVersions("testImages", `${testOrderId}_testImage`);
            addLog(`✅ Old versions deleted!`, "success");
        } catch (error) {
            addLog(`❌ Delete old versions error: ${error.message}`, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const clearLogs = () => setLogs([]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🧪 Image Upload Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Controls */}
                    <div className="space-y-6">
                        {/* Test Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Test Information
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Test Order ID:</span>{" "}
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                        {testOrderId}
                                    </code>
                                </p>
                                <p>
                                    <span className="font-medium">Folder:</span> testImages
                                </p>
                                <p>
                                    <span className="font-medium">File Type:</span> testImage
                                </p>
                            </div>
                        </div>

                        {/* File Selection */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                1. Select File
                            </h2>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {selectedFile && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">Selected:</span>{" "}
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Type: {selectedFile.type}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                2. Upload Actions
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleUploadToTemp}
                                    disabled={!selectedFile || isUploading}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${!selectedFile || isUploading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {isUploading ? "Uploading..." : "Upload to Temp Storage"}
                                </button>

                                <button
                                    onClick={handleFinalize}
                                    disabled={!uploadResult || isFinalizing || finalUrl}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${!uploadResult || isFinalizing || finalUrl
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                >
                                    {isFinalizing ? "Finalizing..." : "Finalize Upload"}
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={!uploadResult || isDeleting}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${!uploadResult || isDeleting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                        }`}
                                >
                                    {isDeleting ? "Deleting..." : "Delete File"}
                                </button>

                                <button
                                    onClick={handleDeleteOldVersions}
                                    disabled={isDeleting}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${isDeleting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-orange-600 text-white hover:bg-orange-700"
                                        }`}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Old Versions"}
                                </button>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Status
                            </h2>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span
                                        className={`w-3 h-3 rounded-full mr-3 ${selectedFile ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    ></span>
                                    <span className="text-gray-700">
                                        {selectedFile ? "✅ File Selected" : "⏳ No File Selected"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span
                                        className={`w-3 h-3 rounded-full mr-3 ${uploadResult ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    ></span>
                                    <span className="text-gray-700">
                                        {uploadResult
                                            ? "✅ Uploaded to Temp"
                                            : "⏳ Not Uploaded"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span
                                        className={`w-3 h-3 rounded-full mr-3 ${finalUrl ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    ></span>
                                    <span className="text-gray-700">
                                        {finalUrl ? "✅ Finalized" : "⏳ Not Finalized"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview & Logs */}
                    <div className="space-y-6">
                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    Preview
                                </h2>
                                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                    {selectedFile?.type.startsWith("image/") ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">PDF File</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Activity Log */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Activity Log
                                </h2>
                                <button
                                    onClick={clearLogs}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {logs.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No activity yet...</p>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-3 rounded-lg text-sm ${log.type === "success"
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : log.type === "error"
                                                    ? "bg-red-50 text-red-800 border border-red-200"
                                                    : "bg-blue-50 text-blue-800 border border-blue-200"
                                                }`}
                                        >
                                            <span className="text-xs text-gray-500">
                                                {log.timestamp}
                                            </span>
                                            <p className="mt-1">{log.message}</p>
                                        </div>
                                    ))
                                )}
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
                        <li>Select an image file (JPG, PNG, WEBP, etc.) or PDF</li>
                        <li>Click "Upload to Temp Storage" - should upload to tempUploads folder</li>
                        <li>Check the activity log for upload confirmation</li>
                        <li>Click "Finalize Upload" - should move file to testImages folder</li>
                        <li>Verify the file is accessible via the final URL</li>
                        <li>Click "Delete File" to clean up</li>
                        <li>Try "Delete Old Versions" to test cleanup utility</li>
                        <li>Check Firebase Storage console to verify operations</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
