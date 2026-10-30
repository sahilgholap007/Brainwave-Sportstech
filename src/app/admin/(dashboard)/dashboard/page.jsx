"use client"
import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { db } from "@/firebase/firebaseconfig" // Use centralized DB config
import {
    Package,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Edit,
    Image as ImageIcon,
    TrendingUp,
    Users,
    DollarSign,
} from "lucide-react"

export default function AdminDashboard() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [fullscreenImage, setFullscreenImage] = useState(null)
    const router = useRouter()
    console.log("orders", orders)
    useEffect(() => {
        fetchOrders()
    }, [])



    const fetchOrders = async () => {
        try {



            // console.log("🔥 [AdminDashboard] DB Instance:", db)

            // Fetch from the new normalized collection
            // We can now query EVERYTHING in one go, sorted by creation date
            // Assuming 'timestamp' or 'createdAt' is the field. Migration script kept original fields.
            // Let's assume 'timestamp' exists as per old data structure.

            const ordersRef = collection(db, "certification_orders")
            const q = query(ordersRef, orderBy("timestamp", "desc")) // Fetch all, sorted

            const snapshot = await getDocs(q)
            const allOrders = []

            snapshot.forEach((doc) => {
                const data = doc.data()
                allOrders.push({
                    ...data,
                    id: doc.id, // Use document ID as order ID key for list
                    // Ensure timestamp is a Date object (Firestore Timestamp to Date)
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : null),
                    // Map 'type' from migration to 'category' for UI consistency if needed, 
                    // though migration script saved 'type'. UI uses 'category' in some places? 
                    // Let's check: UI uses `order.category`
                    category: data.type || data.category || "Unknown"
                })
            })

            setOrders(allOrders)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching orders:", error)
            setLoading(false)
        }
    }

    // Statistics calculations
    const getTodayOrders = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return orders.filter((order) => {
            if (!order.timestamp) return false
            const orderDate = new Date(order.timestamp)
            orderDate.setHours(0, 0, 0, 0)
            return orderDate.getTime() === today.getTime()
        }).length
    }

    const getPendingOrders = () => {
        const pendingStatuses = [
            "Payment received, awaiting samples",
            "Payment received, awaiting inspection",
            "Samples received, testing in 72 hrs",
            "Testing in progress",
            "Inspection scheduled",
            "Inspection in progress",
        ]
        return orders.filter((order) => pendingStatuses.includes(order.order_status)).length
    }

    const getCompletedOrders = () => {
        const completedStatuses = ["Certification Completed", "Certification completed", "Report emailed"]
        return orders.filter((order) => completedStatuses.includes(order.order_status)).length
    }

    const getUniqueCustomers = () => {
        const uniqueEmails = new Set(orders.map((order) => order.email).filter(Boolean))
        return uniqueEmails.size
    }

    const formatDate = (date) => {
        if (!date) return "N/A"
        const d = date instanceof Date ? date : new Date(date)
        if (isNaN(d.getTime())) return "N/A"
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    }

    const formatDateTime = (date) => {
        if (!date) return "N/A"
        const d = date instanceof Date ? date : new Date(date)
        if (isNaN(d.getTime())) return "N/A"
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        let hours = d.getHours()
        const minutes = String(d.getMinutes()).padStart(2, "0")
        const ampm = hours >= 12 ? "PM" : "AM"
        hours = hours % 12 || 12
        return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`
    }

    const getStatusBadgeVariant = (status) => {
        const completedStatuses = ["Certification Completed", "Certification completed", "Report emailed"]
        const pendingStatuses = [
            "Payment received, awaiting samples",
            "Payment received, awaiting inspection",
            "Samples received, testing in 72 hrs",
            "Testing in progress",
            "Inspection scheduled",
            "Inspection in progress",
        ]

        if (completedStatuses.includes(status)) return "default"
        if (pendingStatuses.includes(status)) return "secondary"
        return "outline"
    }

    // Calculate total price including taxes based on payment method
    // This matches the exact logic from /api/generateInvoice/route.js
    const calculateTotalPrice = (order) => {
        // Extract base price from convertedPriceWithSymbol (e.g., "₹5,000" or "$100")
        const priceString = order.convertedPriceWithSymbol || ""
        const currencySymbol = priceString.match(/[^\d.,]/)?.[0] || "₹"

        // Parse the base service amount
        const serviceAmount = parseFloat(priceString.replace(/[^\d.]/g, "")) || 0
        if (serviceAmount === 0) return "N/A"

        // Get payment type
        const paymentType = order?.paymentDetails?.paymentType || order?.paymentType || "Razorpay"
        const isRazorpay = paymentType === "Razorpay"

        // Calculate processing fee (2% for Razorpay, 0% for Manual Bill)
        const processingFee = isRazorpay ? serviceAmount * 0.02 : 0

        // Get customer state
        const customerState = order.state || "Maharashtra"
        const isMaharashtra = customerState.toLowerCase().includes("maharashtra")

        // Calculate taxes
        const subtotal = serviceAmount
        const taxableAmount = subtotal + processingFee

        let cgst = 0
        let sgst = 0
        let igst = 0

        if (isMaharashtra) {
            // Maharashtra: 9% CGST + 9% SGST
            cgst = taxableAmount * 0.09
            sgst = taxableAmount * 0.09
        } else {
            // Other states: 18% IGST
            igst = taxableAmount * 0.18
        }

        const totalTax = cgst + sgst + igst
        const total = taxableAmount + totalTax
        const roundOff = Math.round(total) - total
        const finalTotal = Math.round(total)

        // Format with currency symbol and commas
        const formattedPrice = finalTotal.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

        return `${currencySymbol}${formattedPrice}`
    }

    const recentOrders = orders.slice(0, 8)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header with Split Coloring */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-slate-900">Dashboard </span>
                    <span className="text-orange-500">Overview</span>
                </h1>
                <p className="text-slate-600">Welcome back! Here's what's happening with your orders today.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Total Orders</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{orders.length}</div>
                        <p className="text-xs text-slate-600 mt-1">All time orders</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Today's Orders</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{getTodayOrders()}</div>
                        <p className="text-xs text-slate-600 mt-1">Orders received today</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Pending Orders</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{getPendingOrders()}</div>
                        <p className="text-xs text-slate-600 mt-1">In progress</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Completed</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{getCompletedOrders()}</div>
                        <p className="text-xs text-slate-600 mt-1">Certifications done</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8 border-slate-200 shadow-md rounded-2xl">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                    <CardDescription className="text-slate-600">Frequently used admin functions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => router.push("/admin/process-orders")}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all rounded-lg"
                        >
                            <Package className="h-4 w-4" />
                            Process Orders
                        </Button>
                        <Button
                            onClick={() => router.push("/admin/manage-logos")}
                            variant="outline"
                            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all rounded-lg"
                        >
                            <ImageIcon className="h-4 w-4" />
                            Manage Logos
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-slate-200 shadow-md rounded-2xl">
                <CardHeader className="bg-white border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900">Recent Orders</CardTitle>
                            <CardDescription className="text-slate-600">Latest orders from all categories</CardDescription>
                        </div>
                        <Button
                            onClick={() => router.push("/admin/process-orders")}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {recentOrders.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No orders found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Image</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Order ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Product Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Price</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id || order.orderId}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            {/* Product Image */}
                                            <td className="py-3 px-4">
                                                <div
                                                    className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                                                    onClick={() => {
                                                        const firstCourtImg = Array.isArray(order.courtImages) && order.courtImages[0]
                                                            ? (typeof order.courtImages[0] === 'string' ? order.courtImages[0] : order.courtImages[0]?.url)
                                                            : null
                                                        const imageUrl = order.paddleImage || order.ballImage || order.courtImage || firstCourtImg
                                                        if (imageUrl && typeof imageUrl === 'string') setFullscreenImage(imageUrl)
                                                    }}
                                                >
                                                    {(() => {
                                                        const firstCourtImg = Array.isArray(order.courtImages) && order.courtImages[0]
                                                            ? (typeof order.courtImages[0] === 'string' ? order.courtImages[0] : order.courtImages[0]?.url)
                                                            : null
                                                        const imageUrl = order.paddleImage || order.ballImage || order.courtImage || firstCourtImg

                                                        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== "") {
                                                            return (
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={order.modelName || order.facilityName || "Product"}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-full h-full object-cover"
                                                                    unoptimized={true}
                                                                />
                                                            )
                                                        } else {
                                                            return (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                                                                    <Package className="h-5 w-5 text-purple-600" />
                                                                </div>
                                                            )
                                                        }
                                                    })()}
                                                </div>
                                            </td>

                                            {/* Order ID */}
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-sm text-slate-900">
                                                    {order.id || order.orderId}
                                                </span>
                                            </td>

                                            {/* Product Name */}
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {order.modelName || order.facilityName || "N/A"}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="text-xs font-semibold border-orange-300 text-orange-600 bg-orange-50">
                                                    {order.category === "Ball" ? "Pickleball" : order.category}
                                                </Badge>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3 px-4">
                                                <Badge variant={getStatusBadgeVariant(order.order_status)} className="whitespace-nowrap text-xs">
                                                    {order.order_status || "N/A"}
                                                </Badge>
                                            </td>

                                            {/* Price */}
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                                        {calculateTotalPrice(order)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        (incl. taxes)
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3 px-4">
                                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                                    {formatDateTime(order.timestamp)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Fullscreen Image Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button
                        onClick={() => setFullscreenImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={fullscreenImage}
                            alt="Product Image"
                            width={1200}
                            height={1200}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            unoptimized={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
