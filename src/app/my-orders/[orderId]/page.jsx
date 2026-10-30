"use client"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { AiOutlineEye, AiOutlineClose } from "react-icons/ai"
import {
    Package,
    CheckCircle,
    Clock,
    FileText,
    CreditCard,
    ChevronRight,
    Search,
    Calendar,
    ArrowLeft,
    MapPin,
    Building,
    Layers,
    Info,
    Hash,
    DollarSign,
    User,
    Mail,
    Phone,
    Download
} from "lucide-react"

// --- Helper Components ---

// Premium Status Stepper with "Pulse" effect
const StatusStepper = ({ currentStatus, orderType }) => {
    const isCourt = orderType === "Court";
    const steps = isCourt
        ? [
            { label: "Payment", icon: CreditCard },
            { label: "Scheduled", icon: Calendar },
            { label: "Inspection", icon: Search },
            { label: "Processing", icon: Clock },
            { label: "Certified", icon: CheckCircle },
        ]
        : [
            { label: "Payment", icon: CreditCard },
            { label: "Samples", icon: Package },
            { label: "Testing", icon: Search },
            { label: "Reports", icon: FileText },
            { label: "Certified", icon: CheckCircle },
        ];

    const getStepIndex = (status = "") => {
        const s = status.toLowerCase();
        if (s.includes("certification completed") || s.includes("certificates ready")) return 4;
        if (isCourt) {
            if (s.includes("certification in process")) return 3;
            if (s.includes("inspection in progress") || s.includes("inspection complete")) return 2;
            if (s.includes("inspection scheduled")) return 1;
        } else {
            if (s.includes("report") || s.includes("approval")) return 3;
            if (s.includes("testing")) return 2;
            if (s.includes("samples received")) return 1;
        }
        return 0;
    };

    const activeIndex = getStepIndex(currentStatus);

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10" />

                {/* Active Line (Gradient) */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out -z-10"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === activeIndex;
                    const isCompleted = idx < activeIndex;

                    return (
                        <div key={idx} className="flex flex-col items-center group relative cursor-default">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white relative
                                    ${isActive
                                        ? "border-blue-500 text-blue-600 shadow-lg shadow-blue-200 scale-110"
                                        : isCompleted
                                            ? "border-blue-500 bg-blue-500 text-white"
                                            : "border-slate-200 text-slate-300"
                                    }
                                `}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full border-blue-400 border opacity-75 animate-ping"></span>
                                )}
                                {isCompleted ? <CheckCircle size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                            </div>
                            <div className="absolute top-16 flex flex-col items-center text-center w-32">
                                <span className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? "text-blue-700 translate-y-0" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Bento Grid Item
const BentoItem = ({ icon: Icon, label, value, className = "", delay = 0 }) => {
    if (!value) return null;
    return (
        <div
            className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeInUp ${className}`}
            style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
        >
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                {Icon && <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg"><Icon size={14} /></div>}
            </div>
            <div className="font-bold text-slate-800 text-sm leading-relaxed">{value}</div>
        </div>
    );
};

// --- Page Component ---

export default function OrderDetailsPage({ params }) {
    const { orderId } = use(params)
    const router = useRouter()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [viewerState, setViewerState] = useState({ isOpen: false, images: [], currentIndex: 0 })

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!orderId) return;
                const docRef = doc(db, "certification_orders", orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setOrder({
                        ...data,
                        id: docSnap.id,
                        timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null,
                        convertedPriceWithSymbol: data.convertedPriceWithSymbol || data.totalPriceINR || "N/A"
                    });
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const getOrderType = (item) => {
        if (!item) return "Unknown"
        if (item.paddleImage) return "Paddle"
        if (item.ballImage) return "Ball"
        if (item.courtImages || item.courtImage) return "Court"
        return "Unknown"
    }

    const getDisplayImage = (item) => {
        if (!item) return "/placeholder.jpg"
        if (item.courtImages && item.courtImages.length > 0) {
            const firstImg = item.courtImages[0];
            return typeof firstImg === "string" ? firstImg : firstImg.url;
        }
        return item.paddleImage || item.ballImage || item.courtImage || "/placeholder.jpg"
    }

    const getOrderTitle = (item) => {
        if (!item) return "";
        const type = getOrderType(item);
        if (type === "Court") {
            return item.companyName || `${item.facilityName || ''} ${item.facilityType || ''}`.trim() || item.name;
        }
        return item.companyName || `${item.modelName || ''} ${item.modelNumber || ''}`.trim() || item.name;
    }

    const openImageViewer = (images, index = 0) => {
        const normalizedImages = Array.isArray(images)
            ? images.map(img => (typeof img === 'string' ? img : img.url || "/placeholder.jpg"))
            : [typeof images === 'string' ? images : images?.url || "/placeholder.jpg"];

        setViewerState({ isOpen: true, images: normalizedImages, currentIndex: index })
    }

    const closeImageViewer = () => setViewerState(prev => ({ ...prev, isOpen: false }))
    const nextImage = (e) => { e?.stopPropagation(); setViewerState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length })) }
    const prevImage = (e) => { e?.stopPropagation(); setViewerState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length })) }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                <p className="text-slate-400 font-medium animate-pulse">Loading Details...</p>
            </div>
        </div>
    );

    if (!order) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500">Order not found</div>;

    const selectedItem = order;
    const orderType = getOrderType(selectedItem);

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Immersive Header */}
            <div className="bg-[#0b0f19] relative overflow-hidden pb-32 pt-28">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <button
                        onClick={() => router.push('/my-orders')}
                        className="mb-8 flex items-center text-blue-200/80 hover:text-white transition-colors group w-fit"
                    >
                        <div className="p-2 bg-white/5 rounded-full mr-3 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-semibold text-sm tracking-wide">Back to Orders</span>
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4 animate-fadeInUp" style={{ animationDelay: '0s' }}>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md
                                    ${orderType === 'Court' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                        orderType === 'Paddle' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                                            'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                    }`}>
                                    {orderType} Certification
                                </span>
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {selectedItem.timestamp ? new Date(selectedItem.timestamp).toLocaleDateString() : "N/A"}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                {getOrderTitle(selectedItem)}
                            </h1>
                            <p className="text-slate-400 font-mono text-sm animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Ref: {selectedItem.id}</p>
                        </div>

                        {/* Price Tag */}
                        <div className="text-left md:text-right animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <div className="inline-block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{selectedItem.convertedPriceWithSymbol}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlapping Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">

                {/* Status Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/40 p-8 md:p-10 mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</p>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedItem.order_status || "Processing"}</h2>
                            </div>
                        </div>
                        {selectedItem.order_status?.toLowerCase().includes("certified") && (
                            <button className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                <Download size={16} /> Download Certificate
                            </button>
                        )}
                    </div>
                    <StatusStepper currentStatus={selectedItem.order_status} orderType={orderType} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Visuals & Contact (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Main Image */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden group cursor-pointer animate-fadeInUp" style={{ animationDelay: '0.5s' }}
                            onClick={() => openImageViewer(selectedItem.courtImages?.length ? selectedItem.courtImages : getDisplayImage(selectedItem))}>
                            <div className="aspect-square bg-slate-50 relative p-8 flex items-center justify-center">
                                <img
                                    src={selectedItem.courtImages?.[0]?.url || selectedItem.courtImages?.[0] || getDisplayImage(selectedItem)}
                                    alt="Product Preview"
                                    className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="bg-white/30 backdrop-blur-md border border-white/50 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                                        <AiOutlineEye size={28} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {selectedItem.courtImages?.length > 1 && (
                            <div className="grid grid-cols-4 gap-3 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                {selectedItem.courtImages.slice(0, 4).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-xl border-2 border-slate-100 hover:border-blue-500 overflow-hidden cursor-pointer transition-colors bg-white p-1"
                                        onClick={() => openImageViewer(selectedItem.courtImages, i)}>
                                        <img src={img.url || img} className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/40 p-6 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <User size={20} className="text-blue-500" /> Contact Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Mail size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                        <p className="text-sm font-semibold text-slate-700 truncate" title={selectedItem.email}>{selectedItem.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Phone size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                                        <p className="text-sm font-semibold text-slate-700">{selectedItem.contactNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Specs Bento Grid (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Specs Section */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 px-2 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <Layers size={20} className="text-blue-500" /> Specifications
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Basic Info */}
                                <BentoItem label="Manufacturer" value={selectedItem.manufacturer} delay={0.6} />
                                <BentoItem label="Model Name" value={selectedItem.modelName} delay={0.7} />
                                <BentoItem label="Model Number" value={selectedItem.modelNumber} delay={0.8} />
                                <BentoItem label="Company" value={selectedItem.companyName} delay={0.9} />
                                <BentoItem label="Submission" value={selectedItem.submissionType} delay={1.0} />

                                {/* Dynamic Court/Product Specs */}
                                {orderType === "Court" ? (
                                    <>
                                        <BentoItem label="Surface" value={selectedItem.surfaceType} icon={Layers} delay={1.1} />
                                        <BentoItem label="Color" value={selectedItem.surfaceColorScheme} delay={1.2} />
                                        <BentoItem label="Base" value={selectedItem.baseType} delay={1.3} />
                                        <BentoItem label="Facility Type" value={selectedItem.facilityType} icon={Building} delay={1.4} />
                                        <BentoItem label="Courts" value={selectedItem.numberOfCourts} icon={Hash} delay={1.5} />
                                    </>
                                ) : (
                                    <>
                                        <BentoItem label="Ball Type" value={selectedItem.ballType} delay={1.1} />
                                        <BentoItem label="Material" value={selectedItem.faceMaterial} delay={1.2} />
                                        <BentoItem label="Core" value={selectedItem.coreMaterial} delay={1.3} />
                                        <BentoItem label="Thickness" value={selectedItem.coreThickness} delay={1.4} />
                                        <BentoItem label="Finish" value={selectedItem.surfaceFinish} delay={1.5} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Facility Extra Section */}
                        {orderType === "Court" && (selectedItem.constructionCompany || selectedItem.facilityName) && (
                            <div className="animate-fadeInUp" style={{ animationDelay: '1.6s' }}>
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 px-2 mt-8">
                                    <Building size={20} className="text-blue-500" /> Facility Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building size={24} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facility Name</p>
                                            <p className="font-bold text-slate-800 text-lg">{selectedItem.facilityName || "N/A"}</p>
                                            <p className="text-sm text-slate-500">{selectedItem.facilityLocation}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><User size={24} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Constructor</p>
                                            <p className="font-bold text-slate-800 text-lg">{selectedItem.constructionCompany || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Viewer Overlay */}
            {
                viewerState.isOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn" onClick={closeImageViewer}>
                        <button onClick={closeImageViewer} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"><AiOutlineClose size={28} /></button>
                        {viewerState.images.length > 1 && <button onClick={prevImage} className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"><ChevronRight size={32} className="rotate-180" /></button>}
                        <img src={viewerState.images[viewerState.currentIndex]} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scaleIn select-none" onClick={(e) => e.stopPropagation()} />
                        {viewerState.images.length > 1 && <button onClick={nextImage} className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"><ChevronRight size={32} /></button>}
                    </div>
                )
            }

            <style jsx>{`
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div >
    )
}
