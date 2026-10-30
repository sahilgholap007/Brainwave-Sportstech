"use client"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, WidthType, AlignmentType, BorderStyle, ImageRun, HeadingLevel } from "docx"
import { saveAs } from "file-saver"
import { Download, Filter, Loader2, FileText, CheckCircle, XCircle, RefreshCw, Calendar, RotateCcw } from "lucide-react"

const FILTERS = [
    { key: "all", label: "All Orders" },
    { key: "approved_paddles", label: "Approved Paddles" },
    { key: "approved_balls", label: "Approved Balls" },
]

const APPROVED_STATUSES = ["Certification Completed", "Certification completed"]

export default function AIPAReportPage() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [activeFilter, setActiveFilter] = useState("all")
    const [selectedMonth, setSelectedMonth] = useState("")
    const [selectedYear, setSelectedYear] = useState("")
    const [selectedDate, setSelectedDate] = useState("")
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    console.log("orders", orders)
    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        applyFilter()
    }, [activeFilter, selectedMonth, selectedYear, selectedDate, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const ordersRef = collection(db, "certification_orders")
            const snapshot = await getDocs(ordersRef)
            const allOrders = []
            snapshot.forEach((doc) => {
                const data = doc.data()
                allOrders.push({
                    id: doc.id,
                    modelName: data.modelName || "N/A",
                    companyName: data.companyName || data.company || "N/A",
                    orderId: data.orderId || doc.id,
                    category: data.category || data.type || "Unknown",
                    order_status: data.order_status || "Pending",
                    dateOfCertification: data.dateOfCertification || null,
                    timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null,
                    paddleImage: data.paddleImage || null,
                    ballImage: data.ballImage || null,
                })
            })
            allOrders.sort((a, b) => {
                if (!a.timestamp) return 1
                if (!b.timestamp) return -1
                return b.timestamp - a.timestamp
            })
            setOrders(allOrders)
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilter = () => {
        let result = [...orders]
        if (activeFilter === "approved_paddles") {
            result = result.filter(
                (o) => o.category === "Paddle" && APPROVED_STATUSES.includes(o.order_status)
            )
        } else if (activeFilter === "approved_balls") {
            result = result.filter(
                (o) => o.category === "Ball" && APPROVED_STATUSES.includes(o.order_status)
            )
        }

        // Date filters
        if (selectedDate) {
            const targetDate = new Date(selectedDate)
            result = result.filter((o) => {
                if (!o.timestamp) return false
                const d = new Date(o.timestamp)
                return d.getFullYear() === targetDate.getFullYear() &&
                    d.getMonth() === targetDate.getMonth() &&
                    d.getDate() === targetDate.getDate()
            })
        } else {
            if (selectedYear) {
                const year = parseInt(selectedYear)
                result = result.filter((o) => {
                    if (!o.timestamp) return false
                    return new Date(o.timestamp).getFullYear() === year
                })
            }
            if (selectedMonth) {
                const month = parseInt(selectedMonth)
                result = result.filter((o) => {
                    if (!o.timestamp) return false
                    return new Date(o.timestamp).getMonth() === month
                })
            }
        }

        setFilteredOrders(result)
    }

    const clearDateFilters = () => {
        setSelectedMonth("")
        setSelectedYear("")
        setSelectedDate("")
    }

    const getAvailableYears = () => {
        const years = new Set()
        orders.forEach((o) => {
            if (o.timestamp) years.add(new Date(o.timestamp).getFullYear())
        })
        return Array.from(years).sort((a, b) => b - a)
    }

    const MONTHS = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const isApproved = (status) => APPROVED_STATUSES.includes(status)

    const getProductImage = (order) => {
        if (order.category === "Paddle" && order.paddleImage) {
            return Array.isArray(order.paddleImage) ? order.paddleImage[0] : order.paddleImage
        }
        if (order.category === "Ball" && order.ballImage) {
            return Array.isArray(order.ballImage) ? order.ballImage[0] : order.ballImage
        }
        return null
    }

    const fetchImageAsBuffer = async (url) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            return await blob.arrayBuffer()
        } catch (e) {
            console.warn("Failed to fetch image:", url, e)
            return null
        }
    }

    const handleDownload = async () => {
        try {
            setDownloading(true)

            const filterLabel = FILTERS.find((f) => f.key === activeFilter)?.label || "All Orders"
            const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

            // Prefetch all images
            const imageBuffers = await Promise.all(
                filteredOrders.map(async (order) => {
                    const url = getProductImage(order)
                    if (url) return await fetchImageAsBuffer(url)
                    return null
                })
            )

            // Build Table Header
            const headerTexts = ["#", "Product", "Model Name", "Company", "Order No", "Category", "Date of Approval", "Approved"]
            const headerRow = new TableRow({
                tableHeader: true,
                children: headerTexts.map(
                    (text) =>
                        new TableCell({
                            width: { size: text === "#" ? 5 : (text === "Product" ? 12 : 12), type: WidthType.PERCENTAGE },
                            shading: { fill: "1e293b" },
                            verticalAlign: "center",
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text, bold: true, color: "ffffff", size: 20, font: "Calibri" })],
                                }),
                            ],
                        })
                ),
            })

            // Build Table Rows
            const dataRows = filteredOrders.map((order, index) => {
                const approved = isApproved(order.order_status)
                const imgBuffer = imageBuffers[index]

                // Build Product Photo cell content
                const photoCellChildren = []
                if (imgBuffer) {
                    photoCellChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: imgBuffer,
                                    transformation: { width: 60, height: 60 },
                                    type: "png",
                                }),
                            ],
                        })
                    )
                } else {
                    photoCellChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: "No Image", size: 16, color: "94a3b8", font: "Calibri", italics: true })],
                        })
                    )
                }

                const cells = [
                    // #
                    new TableCell({
                        width: { size: 5, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: String(index + 1), size: 18, font: "Calibri" })],
                            }),
                        ],
                    }),
                    // Product Photo
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: photoCellChildren,
                    }),
                    // Model Name
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: order.modelName, size: 18, font: "Calibri" })],
                            }),
                        ],
                    }),
                    // Company
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: order.companyName, size: 18, font: "Calibri" })],
                            }),
                        ],
                    }),
                    // Order No
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: String(order.orderId), size: 18, font: "Calibri" })],
                            }),
                        ],
                    }),
                    // Category
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: order.category, size: 18, font: "Calibri" })],
                            }),
                        ],
                    }),
                    // Date of Approval
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: order.dateOfCertification || (approved ? "Date N/A" : "—"),
                                        size: 18,
                                        font: "Calibri",
                                    }),
                                ],
                            }),
                        ],
                    }),
                    // Approved
                    new TableCell({
                        width: { size: 12, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: approved ? "Yes ✔" : "No ✖",
                                        bold: true,
                                        color: approved ? "16a34a" : "dc2626",
                                        size: 18,
                                        font: "Calibri",
                                    }),
                                ],
                            }),
                        ],
                    }),
                ]

                return new TableRow({ children: cells })
            })

            const table = new Table({
                rows: [headerRow, ...dataRows],
                width: { size: 100, type: WidthType.PERCENTAGE },
            })

            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: {
                                margin: { top: 720, bottom: 720, left: 720, right: 720 },
                            },
                        },
                        children: [
                            new Paragraph({
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "AIPA Report", bold: true, size: 32, font: "Calibri" }),
                                ],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 300 },
                                children: [
                                    new TextRun({
                                        text: `Filter: ${filterLabel}  |  Generated: ${dateStr}  |  Total: ${filteredOrders.length} orders`,
                                        size: 20,
                                        color: "64748b",
                                        font: "Calibri",
                                    }),
                                ],
                            }),
                            table,
                        ],
                    },
                ],
            })

            const blob = await Packer.toBlob(doc)
            saveAs(blob, `AIPA_Report_${activeFilter}_${dateStr.replace(/ /g, "_")}.docx`)
        } catch (error) {
            console.error("Error generating report:", error)
            alert("Failed to generate report. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return "—"
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-slate-500">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-purple-600" />
                        AIPA Report
                    </h1>
                    <p className="text-slate-500 mt-1">Download order data as a Word document</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading || filteredOrders.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {downloading ? "Generating..." : "Download Report"}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 space-y-4">
                {/* Product Type Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Filter className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 mr-2">Type:</span>
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === f.key
                                ? "bg-purple-600 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <span className="ml-auto text-sm text-slate-500">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-3 flex-wrap border-t border-slate-100 pt-4">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 mr-2">Date:</span>

                    {/* Month */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate("") }}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">All Months</option>
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>

                    {/* Year */}
                    <select
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedDate("") }}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">All Years</option>
                        {getAvailableYears().map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <span className="text-slate-400 text-xs">or</span>

                    {/* Specific Date */}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setSelectedMonth(""); setSelectedYear("") }}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />

                    {(selectedMonth || selectedYear || selectedDate) && (
                        <button
                            onClick={clearDateFilters}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Model Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date of Approval</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Approved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                        No orders found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => {
                                    const imgUrl = getProductImage(order)
                                    const approved = isApproved(order.order_status)
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                {imgUrl ? (
                                                    <img
                                                        src={imgUrl}
                                                        alt={order.modelName}
                                                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                                                        N/A
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{order.modelName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{order.companyName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">{order.orderId}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.category === "Paddle"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : order.category === "Ball"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                    {order.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {order.dateOfCertification || (approved ? "Date N/A" : "—")}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {approved ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
