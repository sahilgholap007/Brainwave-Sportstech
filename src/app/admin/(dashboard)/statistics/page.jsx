"use client"
import { useState, useEffect } from "react"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"
import {
    TrendingUp, DollarSign, Package, Calendar,
    Award, BarChart3, PieChart as PieChartIcon
} from "lucide-react"

import { db } from "@/firebase/firebaseconfig"

export default function Statistics() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {




            const ordersRef = collection(db, "certification_orders")
            const snapshot = await getDocs(ordersRef)
            const allOrders = []

            snapshot.forEach((doc) => {
                const data = doc.data()
                allOrders.push({
                    ...data,
                    id: doc.id,
                    // Ensure timestamp is a Date object
                    timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null,
                    // Map 'type' (from migration) to 'category' for chart logic
                    // If 'category' already exists, use it, otherwise fall back to 'type'
                    category: data.category || data.type || "Unknown",
                })
            })

            // Sort by Date (Newest first)
            allOrders.sort((a, b) => {
                if (!a.timestamp) return 1
                if (!b.timestamp) return -1
                return b.timestamp - a.timestamp
            })

            setOrders(allOrders)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching orders:", error)
            setLoading(false)
        }
    }

    // Calculate total price with taxes (matching invoice logic)
    const calculateTotalPrice = (order) => {
        const priceString = order.convertedPriceWithSymbol || ""
        const serviceAmount = parseFloat(priceString.replace(/[^\d.]/g, "")) || 0
        if (serviceAmount === 0) return 0

        const paymentType = order?.paymentDetails?.paymentType || order?.paymentType || "Razorpay"
        const isRazorpay = paymentType === "Razorpay"
        const processingFee = isRazorpay ? serviceAmount * 0.02 : 0

        const customerState = order.state || "Maharashtra"
        const isMaharashtra = customerState.toLowerCase().includes("maharashtra")

        const taxableAmount = serviceAmount + processingFee
        const totalTax = isMaharashtra ? taxableAmount * 0.18 : taxableAmount * 0.18
        const total = taxableAmount + totalTax

        return Math.round(total)
    }

    // Analytics calculations
    const totalRevenue = orders.reduce((sum, order) => sum + calculateTotalPrice(order), 0)
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Monthly data
    const monthlyData = {}
    orders.forEach(order => {
        if (order.timestamp) {
            const monthKey = `${order.timestamp.getFullYear()}-${String(order.timestamp.getMonth() + 1).padStart(2, '0')}`
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, orders: 0, revenue: 0 }
            }
            monthlyData[monthKey].orders += 1
            monthlyData[monthKey].revenue += calculateTotalPrice(order)
        }
    })

    const monthlyChartData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(item => ({
            month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            orders: item.orders,
            revenue: Math.round(item.revenue)
        }))

    // Category distribution
    const categoryData = [
        { name: 'Paddle', value: orders.filter(o => o.category === 'Paddle').length, color: '#8b5cf6' },
        { name: 'Pickleball', value: orders.filter(o => o.category === 'Ball').length, color: '#f59e0b' },
        { name: 'Court', value: orders.filter(o => o.category === 'Court').length, color: '#3b82f6' },
    ].filter(item => item.value > 0)

    // Status distribution
    const statusCounts = {}
    orders.forEach(order => {
        const status = order.order_status || 'Unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

    // Payment method distribution
    const paymentCounts = {}
    orders.forEach(order => {
        let paymentType = order?.paymentDetails?.paymentType || order?.paymentType || 'Razorpay'
        // Ensure consistent naming
        if (paymentType === 'Manual Bill') paymentType = 'Bank Transfer'

        paymentCounts[paymentType] = (paymentCounts[paymentType] || 0) + 1
    })
    const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }))

    // Best performing month
    const bestMonth = monthlyChartData.reduce((best, current) =>
        current.revenue > (best?.revenue || 0) ? current : best
        , null)

    // Growth calculation (last 2 months)
    const growthRate = monthlyChartData.length >= 2
        ? ((monthlyChartData[monthlyChartData.length - 1].revenue - monthlyChartData[monthlyChartData.length - 2].revenue) /
            monthlyChartData[monthlyChartData.length - 2].revenue * 100).toFixed(1)
        : 0

    const COLORS = ['#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#6366f1']

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-slate-600">Loading statistics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-slate-900">Analytics & </span>
                    <span className="text-orange-500">Statistics</span>
                </h1>
                <p className="text-slate-600">Comprehensive overview of orders, revenue, and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Total Revenue</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-slate-600 mt-1">Including all taxes</p>
                    </CardContent>
                </Card>

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
                        <CardTitle className="text-sm font-medium text-slate-700">Avg Order Value</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</div>
                        <p className="text-xs text-slate-600 mt-1">Per order average</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Monthly Growth</CardTitle>
                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{growthRate}%</div>
                        <p className="text-xs text-slate-600 mt-1">Last month vs previous</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Revenue Chart */}
                <Card className="border-slate-200 shadow-md rounded-2xl">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            Monthly Revenue Trend
                        </CardTitle>
                        <CardDescription className="text-slate-600">Revenue breakdown by month</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                />
                                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Orders Timeline */}
                <Card className="border-slate-200 shadow-md rounded-2xl">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Orders Timeline
                        </CardTitle>
                        <CardDescription className="text-slate-600">Order volume over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyChartData}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="orders" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Category Distribution */}
                <Card className="border-slate-200 shadow-md rounded-2xl">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                            Category Split
                        </CardTitle>
                        <CardDescription className="text-slate-600">Orders by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payment Method Distribution */}
                <Card className="border-slate-200 shadow-md rounded-2xl">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <CardTitle className="text-slate-900">Payment Methods</CardTitle>
                        <CardDescription className="text-slate-600">Payment type breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={paymentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Best Performing Month */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader>
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-600" />
                            Best Month
                        </CardTitle>
                        <CardDescription className="text-slate-700">Highest revenue period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {bestMonth && (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600">Month</p>
                                    <p className="text-2xl font-bold text-purple-700">{bestMonth.month}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Revenue</p>
                                    <p className="text-2xl font-bold text-slate-900">₹{bestMonth.revenue.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Orders</p>
                                    <p className="text-2xl font-bold text-slate-900">{bestMonth.orders}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown Table */}
            <Card className="border-slate-200 shadow-md rounded-2xl">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-slate-900">Order Status Breakdown</CardTitle>
                    <CardDescription className="text-slate-600">Distribution of orders by status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Count</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statusData.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm text-slate-700">{item.name}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">{item.value}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">
                                            {((item.value / orders.length) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
