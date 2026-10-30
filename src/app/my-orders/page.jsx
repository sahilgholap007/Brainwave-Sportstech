
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/firebaseconfig"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { AiOutlineClose, AiOutlineEye } from "react-icons/ai" // Added AiOutlineEye
import { ImageSlider } from "@/components/image-slider"
import {
  Package,
  CheckCircle,
  Clock,
  FileText,
  Truck,
  CreditCard,
  ChevronRight,
  Search,
  Calendar
} from "lucide-react"

// --- Helper Components ---

const StatusStepper = ({ currentStatus, orderType }) => {
  const isCourt = orderType === "Court";

  const steps = isCourt
    ? [
      { label: "Payment", icon: CreditCard },
      { label: "Scheduled", icon: Calendar }, // "Inspection scheduled"
      { label: "Inspection", icon: Search },    // "Inspection in progress/complete"
      { label: "Processing", icon: Clock },     // "Certification in process"
      { label: "Certified", icon: CheckCircle },// "Certification completed"
    ]
    : [
      { label: "Payment", icon: CreditCard },
      { label: "Samples", icon: Package },      // "Samples received..."
      { label: "Testing", icon: Search },      // "Testing in progress/complete"
      { label: "Reports", icon: FileText },     // "Reports submitted..." / "Report emailed"
      { label: "Certified", icon: CheckCircle },// "Certification Completed"
    ];

  // Map backend status to step index
  const getStepIndex = (status = "") => {
    const s = status.toLowerCase();

    // 1. Certified (Final Step)
    if (s.includes("certification completed") || s.includes("certificates ready")) return 4;

    if (isCourt) {
      // Court Logic
      if (s.includes("certification in process")) return 3;
      if (s.includes("inspection in progress") || s.includes("inspection complete")) return 2;
      if (s.includes("inspection scheduled")) return 1;
      // Default / Payment received / Awaiting inspection
    } else {
      // Product Logic
      if (s.includes("report") || s.includes("approval")) return 3; // "Reports submitted", "Report emailed"
      if (s.includes("testing")) return 2; // "Testing in progress", "Testing complete"
      if (s.includes("samples received")) return 1; // Strict check for "received"
      // "Payment received, awaiting samples" will fall through to 0
    }

    return 0; // Default: Payment Received
  };

  const activeIndex = getStepIndex(currentStatus);

  return (

    <div className="w-full mt-4 mb-2 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-3 w-full h-1 bg-gray-100 rounded-full z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute left-0 top-3 h-1 bg-green-500 rounded-full transition-all duration-500 z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx <= activeIndex;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 w-8 group/step cursor-default">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white group-hover/step:scale-110 ${isActive
                  ? "border-green-500 text-green-600 shadow-md scale-110"
                  : "border-gray-200 text-gray-300"
                  }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`absolute top-10 whitespace-nowrap text-[10px] font-medium tracking-wide uppercase transition-colors duration-300 group-hover/step:text-gray-800 ${isActive ? "text-green-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for labels */}
    </div>
  );
};


const MyOrders = () => {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [processedOrders, setProcessedOrders] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)


  
  const [filterType, setFilterType] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const ordersPerPage = 6 // Grid layout allows more items

  const handleViewDetails = (item) => {
    router.push(`/my-orders/${item.id}`)
  }

  // Fetch processed orders from new certification_orders collection
  const fetchProcessedOrders = async (userId) => {
    try {
      if (!userId) return

      const ordersRef = collection(db, "certification_orders")
      const q = query(ordersRef, where("userId", "==", userId))

      const snapshot = await getDocs(q)
      const userOrders = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        userOrders.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null,
          convertedPriceWithSymbol: data.convertedPriceWithSymbol || data.totalPriceINR || "N/A"
        })
      })

      // Sort by timestamp (most recent first)
      userOrders.sort((a, b) => {
        const dateA = a.timestamp || new Date(0)
        const dateB = b.timestamp || new Date(0)
        return dateB - dateA
      })

      setProcessedOrders(userOrders)
    } catch (error) {
      console.error("Error fetching processed orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        setUserId(null)
        setProcessedOrders([])
        setIsLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchProcessedOrders(userId)
    }
  }, [userId])
  // Determine order type
  const getOrderType = (order) => {
    if (order.paddleImage) return "Paddle"
    if (order.ballImage) return "Pickleball"
    if (order.courtImages || order.courtImage) return "Court"
    return "Unknown"
  }

  // Determine display title
  const getOrderTitle = (order) => {
    const type = getOrderType(order)
    if (type === "Court") {
      return order.companyName || `${order.facilityName || ''} ${order.facilityType || ''}`.trim() || order.name
    }
    return order.companyName || `${order.modelName || ''} ${order.modelNumber || ''}`.trim() || order.name
  }

  const filteredOrders = processedOrders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      order.name?.toLowerCase().includes(searchLower) ||
      order.id?.toLowerCase().includes(searchLower) ||
      (order.companyName && order.companyName.toLowerCase().includes(searchLower)) ||
      (order.order_status && order.order_status.toLowerCase().includes(searchLower)) ||
      (order.modelName && order.modelName.toLowerCase().includes(searchLower))

    if (!matchesSearch) return false

    if (filterType !== "All") {
      const type = getOrderType(order);
      if (type !== filterType) return false;
    }

    if (statusFilter !== "All") {
      const isCompleted = order.order_status?.toLowerCase().includes("completed") ||
        order.order_status?.toLowerCase().includes("certified");

      if (statusFilter === "Completed" && !isCompleted) return false;
      if (statusFilter === "Active" && isCompleted) return false;
    }

    return true
  })

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)



  // Get display image
  const getDisplayImage = (order) => {
    if (order.courtImages && order.courtImages.length > 0) {
      // Handle object vs string (if string, return it; if object, return url)
      const firstImg = order.courtImages[0];
      return typeof firstImg === "string" ? firstImg : firstImg.url;
    }
    return order.paddleImage || order.ballImage || order.courtImage || "/placeholder.jpg"
  }

  // --- Image Viewer State ---
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  })

  const openImageViewer = (images, index = 0) => {
    // Normalize to array of strings
    const normalizedImages = Array.isArray(images)
      ? images.map(img => (typeof img === 'string' ? img : img.url || "/placeholder.jpg"))
      : [typeof images === 'string' ? images : images?.url || "/placeholder.jpg"];

    setViewerState({
      isOpen: true,
      images: normalizedImages,
      currentIndex: index
    })
  }

  const closeImageViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }))
  }

  const nextImage = (e) => {
    e?.stopPropagation()
    setViewerState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  const prevImage = (e) => {
    e?.stopPropagation()
    setViewerState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 py-28 px-4 sm:px-6 md:px-8 font-sans">
      {/* Decorative Blur Header */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-slate-50/0 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2c3e50] tracking-tight">My Orders</h1>
            <p className="text-gray-500 mt-1">Track and manage your certification requests</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
          {/* Type Filters */}
          <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 inline-flex shadow-sm">
            {["All", "Pickleball", "Paddle", "Court"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filterType === type
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 inline-flex shadow-sm">
            {["All", "Active", "Completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${statusFilter === status
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-500 hover:text-blue-600 hover:bg-white/80"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 w-16 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                </div>
                <div className="flex gap-4 items-center mb-6">
                  <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-8 w-full bg-slate-200 rounded-xl"></div>
                  <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 && searchQuery === "" && filterType === "All" ? (
          // Launchpad Empty State
          <div className="py-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-sm">
                <Package size={40} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">No Certification Requests Yet</h2>
              <p className="text-gray-500 max-w-md mx-auto text-lg">
                Ready to get started? Choose a certification type below to begin your application process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Paddle Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-8 border border-orange-100/50 hover:shadow-xl hover:shadow-orange-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/pickle-ball-paddle-testing")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paddle Certification</h3>
                <p className="text-sm text-gray-600 mb-6">Submit your paddle designs for USAPA approval and performance testing.</p>
                <button className="flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>

              {/* Ball Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-3xl p-8 border border-yellow-100/50 hover:shadow-xl hover:shadow-yellow-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/pickle-ball-testing")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-yellow-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Package size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ball Certification</h3>
                <p className="text-sm text-gray-600 mb-6">Get your pickleballs tested for durability, bounce, and official standards.</p>
                <button className="flex items-center gap-2 text-yellow-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>

              {/* Court Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 border border-blue-100/50 hover:shadow-xl hover:shadow-blue-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/court-certification")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Court Inspector</h3>
                <p className="text-sm text-gray-600 mb-6">Schedule an on-site inspection for professional court certification.</p>
                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Search/Filter Empty State (keep existing simple one)
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">No orders found matching your filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setFilterType("All") }}
              className="mt-4 text-blue-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="group bg-white rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card Header: ID & Date */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide border ${getOrderType(order) === "Paddle" ? "bg-orange-50 text-orange-600 border-orange-100" :
                        getOrderType(order) === "Pickleball" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                        {getOrderType(order)}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-3 font-mono tracking-tight opacity-70">#{order.id}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg">
                      {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  {/* Main Content: Image & Title */}
                  <div className="flex gap-5 items-center mb-8">
                    <div
                      className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 cursor-pointer group/img shadow-inner"
                      onClick={() => openImageViewer(
                        order.courtImages?.length > 0 ? order.courtImages : getDisplayImage(order)
                      )}
                    >
                      <img
                        src={getDisplayImage(order) || "/placeholder.svg"}
                        alt={order.name}
                        className="w-full h-full object-contain p-2 group-hover/img:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-lg leading-tight truncate pr-2">{getOrderTitle(order)}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium truncate">{order.modelName || "Standard Model"}</p>
                      <p className="text-sm font-bold text-slate-900 mt-3 bg-slate-50 inline-block px-2 py-1 rounded-lg">{order.convertedPriceWithSymbol}</p>
                    </div>
                  </div>

                  {/* Status Stepper */}
                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <div className="mb-4 flex justify-between items-end">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Current Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${order.order_status?.toLowerCase().includes("completed") || order.order_status?.toLowerCase().includes("certified")
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                        {order.order_status || "Processing"}
                      </span>
                    </div>
                    {/* Simplified status bar for card view can remain, or we can keep the full stepper */}
                    <StatusStepper currentStatus={order.order_status} orderType={getOrderType(order)} />

                    <button
                      onClick={() => handleViewDetails(order)}
                      className="w-full mt-6 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      View Details <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-gray-600 hover:bg-slate-50"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Screen Gallery Viewer */}
      {
        viewerState.isOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none"
            onClick={closeImageViewer}
          >
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
            >
              <AiOutlineClose size={32} />
            </button>

            {/* Navigation - Left */}
            {viewerState.images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
              >
                <ChevronRight size={32} className="rotate-180" />
              </button>
            )}

            {/* Main Image */}
            <img
              src={viewerState.images[viewerState.currentIndex]}
              alt={`View ${viewerState.currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation - Right */}
            {viewerState.images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Counter */}
            {viewerState.images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                {viewerState.currentIndex + 1} / {viewerState.images.length}
              </div>
            )}
          </div>
        )
      }

      <style jsx>{`
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeInUp { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div >
  )
}

export default MyOrders
