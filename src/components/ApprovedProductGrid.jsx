"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaSearch, FaFilter } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import CertificateVerificationModal from "./CertificateVerificationModal";

const ApprovedProductGrid = ({
    products = [],
    title,
    subtitle,
    typeOptions = [],
    typeLabel = "Type"
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filter Logic
    const filteredProducts = products.filter((product) => {
        const searchLower = searchQuery.toLowerCase();
        const matchSearch =
            (product.company || product.companyName || product.manufacturer || "").toLowerCase().includes(searchLower) ||
            (product.modelName || product.modelNumber || "").toLowerCase().includes(searchLower);

        const matchType = filterType === "All" ||
            (product.paddleShape === filterType) ||
            (product.useType === filterType);

        return matchSearch && matchType;
    });

    // Helper to parse date for sorting
    const getDateValue = (item) => {
        // Priority 1: Certification Date (DD/MM/YYYY)
        if (item.dateOfCertification) {
            const parts = item.dateOfCertification.split('/');
            if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
            }
        }

        // Priority 2: Timestamp (Firestore Object or String)
        if (item.timestamp) {
            if (item.timestamp.seconds) {
                return item.timestamp.seconds * 1000;
            }
            return new Date(item.timestamp).getTime();
        }

        return 0; // Fallback for no date
    };

    // Sort: Newest First
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        return getDateValue(b) - getDateValue(a);
    });

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const nextPage = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

    // Helper to safely parse dates (handles DD/MM/YYYY or ISO)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        // Check for DD/MM/YYYY format e.g. "14/2/2025"
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                // Assume Day/Month/Year
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);

                // Basic validation
                if (day > 12 && month <= 12) {
                    // Definitely Day/Month/Year
                    // JS Date constructor: Year, MonthIndex (0-11), Day
                    return new Date(year, month - 1, day).toLocaleDateString();
                }

                // Ambiguous or other format: Try creating date object by rearranging to YYYY-MM-DD
                // Or just trust it's DD/MM/YYYY as per locale commonality here (India/UK)
                return new Date(year, month - 1, day).toLocaleDateString();
            }
        }

        const d = new Date(dateString);
        return isNaN(d.getTime()) ? dateString : d.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-24 md:py-32 px-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Certified Products</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-4">
                    {title}
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {subtitle}
                </p>
            </div>

            {/* Filters & Search */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Company, Brand or Model"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f39c12]/50 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative md:w-64">
                        <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f39c12]/50 focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                            <option value="All">All {typeLabel}s</option>
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentProducts.map((item, idx) => {
                            const imageSrc = item.paddleImage || item.ballImage;
                            const uniqueKey = item.id || item.orderId || imageSrc || idx;
                            return (
                                <div
                                    key={uniqueKey}
                                    className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1 relative overflow-hidden"
                                >
                                    {/* Image Area */}
                                    <div
                                        className="relative aspect-square mb-4 bg-slate-50 rounded-xl overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedProduct(item)}
                                    >
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={item.modelName || "Product"}
                                                fill
                                                unoptimized={true}
                                                onError={(e) => {
                                                    e.target.style.display = 'none'; // Hide broken image
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-300 text-xs">Image Error</div>'; // Show fallback
                                                }}
                                                className="object-contain group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                No Image
                                            </div>
                                        )}
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-[#f39c12] uppercase tracking-wider">
                                                {item.companyName || item.company || item.manufacturer}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1" title={item.modelName || item.modelNumber}>
                                            {item.modelName || item.modelNumber || "Unknown Model"}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-2">
                                            <span className="bg-slate-100 px-2 py-1 rounded-md">
                                                {item.paddleShape || item.useType || "Standard"}
                                            </span>
                                            {item.order_status === "Certification Completed" ? (
                                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                                                    AIPA Certified
                                                </span>
                                            ) : (
                                                <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md border border-yellow-100">
                                                    In Process
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 flex justify-center items-center text-xs">
                                            <span className={`font-bold ${item.order_status === "Certification Completed" ? "text-gray-600" : "text-yellow-600"}`}>
                                                {item.order_status === "Certification Completed"
                                                    ? formatDate(item.dateOfCertification)
                                                    : "In Progress"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="px-6 py-3 bg-white border border-slate-200 text-[#2c3e50] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 font-medium px-4">
                            Page <span className="text-[#f39c12] font-bold">{currentPage}</span> of {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="px-6 py-3 bg-[#f39c12] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f39c12]/90 transition-colors shadow-sm shadow-orange-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Certificate Verification Modal */}
            <CertificateVerificationModal 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                product={selectedProduct} 
            />

            <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default ApprovedProductGrid;
