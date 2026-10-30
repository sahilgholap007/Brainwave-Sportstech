import { X, ShoppingCart, Package, Calendar, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default function UserDetails({ user, onClose, orders = [] }) {
    if (!user) return null

    // Calculate user stats
    const userOrders = orders.filter(o => o.userId === user.id)
    const totalSpent = userOrders.reduce((sum, order) => {
        // Parse the price safely
        const priceString = order.convertedPriceWithSymbol || "0"
        return sum + (parseFloat(priceString.replace(/[^\d.]/g, "")) || 0)
    }, 0)

    const cartItems = user.cart || []

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-100 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{user.displayName || "Unknown User"}</h2>
                        <p className="text-slate-500 text-sm">{user.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 rounded-full">
                        <X className="h-6 w-6 text-slate-500" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Orders</p>
                            <p className="text-2xl font-bold text-purple-900">{userOrders.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Spent</p>
                            <p className="text-2xl font-bold text-green-900">₹{totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Cart Items</p>
                            <p className="text-2xl font-bold text-blue-900">{cartItems.length}</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" /> Contact Details
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">{user.phoneNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">Joined: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 w-4 font-mono text-center">ID</span>
                                <span className="text-slate-500 font-mono text-xs select-all bg-white px-1 py-0.5 rounded border">{user.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Cart */}
                    <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                            <ShoppingCart className="h-4 w-4 text-orange-500" /> Current Cart ({cartItems.length})
                        </h3>
                        {cartItems.length > 0 ? (
                            <div className="bg-white border rounded-lg overflow-hidden">
                                {cartItems.map((item, i) => (
                                    <div key={i} className="p-4 border-b last:border-0 flex gap-4 items-start hover:bg-slate-50">
                                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center shrink-0">
                                            <Package className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{item.productName || item.testType || "Unknown Item"}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-slate-900">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <ShoppingCart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Cart is empty</p>
                            </div>
                        )}
                    </div>

                    {/* Order History */}
                    <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4 text-purple-500" /> Order History ({userOrders.length})
                        </h3>
                        {userOrders.length > 0 ? (
                            <div className="space-y-3">
                                {userOrders.map((order) => (
                                    <div key={order.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-medium text-slate-500">#{order.id.slice(-6)}</span>
                                                    <Badge variant={
                                                        order.order_status === "Completed" ? "success" :
                                                            order.order_status === "Pending" ? "warning" : "secondary"
                                                    } className="text-[10px] px-1.5 py-0 h-5">
                                                        {order.order_status || "Pending"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-slate-900 mt-1">{order.productName || "Certification Service"}</p>
                                            </div>
                                            <p className="font-bold text-slate-900">{order.convertedPriceWithSymbol}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t mt-2">
                                            <span>{order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A'}</span>
                                            <span>{order.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No orders placed yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
