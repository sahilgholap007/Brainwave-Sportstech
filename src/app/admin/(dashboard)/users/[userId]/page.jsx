"use client"
import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingCart, Package, CreditCard, Clock, ShieldAlert } from "lucide-react"

export default function UserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.userId

    const [user, setUser] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userId) {
            fetchUserData()
        }
    }, [userId])

    const fetchUserData = async () => {
        try {
            setLoading(true)

            // 1. Fetch User Doc
            const userDoc = await getDoc(doc(db, "users", userId))

            // 2. Fetch User Orders (by userId or by email for legacy orders)
            // Note: Since Firestore doesn't support OR queries across different fields easily, 
            // we will fetch all orders and filter them on the client since this is an admin dashboard.
            const allOrdersSnap = await getDocs(collection(db, "certification_orders"))
            let userData = null;

            if (userDoc.exists()) {
                userData = { id: userDoc.id, ...userDoc.data() }
                setUser(userData)
            }

            const ordersSnap = {
                docs: allOrdersSnap.docs.filter(d => 
                    d.data().userId === userId || 
                    (userData && userData.email && d.data().email === userData.email)
                )
            };

            const ordersList = ordersSnap.docs.map(d => {
                const data = d.data();
                let parsedDate = new Date();
                if (data.timestamp) {
                    if (data.timestamp.toDate) parsedDate = data.timestamp.toDate();
                    else if (data.timestamp.seconds) parsedDate = new Date(data.timestamp.seconds * 1000);
                    else parsedDate = new Date(data.timestamp);
                }
                return {
                    id: d.id,
                    ...data,
                    timestamp: parsedDate
                };
            });

            // Sort by date desc
            ordersList.sort((a, b) => b.timestamp - a.timestamp)

            setOrders(ordersList)
        } catch (error) {
            console.error("Error fetching user details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loader border-t-purple-600"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-bold">User Not Found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const totalSpent = orders.reduce((sum, order) => {
        const priceString = order.convertedPriceWithSymbol || "0"
        return sum + (parseFloat(priceString.replace(/[^\d.]/g, "")) || 0)
    }, 0)

    const cartItems = user.cart || []

    return (
        <div className="space-y-6 pb-12">
            {/* Top Bar */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{user.displayName || "Unknown User"}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
                        <span>ID: {user.id}</span>
                        {user.metadata?.creationTime && (
                            <span>• Joined {new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Ban User
                    </Button>
                    {/* Placeholder for Edit/Role actions */}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Profile & Stats */}
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-600 font-bold uppercase">Orders</p>
                                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase">Total Spent</p>
                                <p className="text-xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 col-span-2 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase">Cart Items</p>
                                    <p className="text-2xl font-bold text-slate-900">{cartItems.length}</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" /> Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="select-all">{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="select-all">{user.phoneNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>Last Active: {user.lastActive ? (
                                    user.lastActive.toDate ? user.lastActive.toDate().toLocaleString() : 
                                    user.lastActive.seconds ? new Date(user.lastActive.seconds * 1000).toLocaleString() : 
                                    new Date(user.lastActive).toLocaleString()
                                ) : "N/A"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Tabs (Cart, Orders, Logs) */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none p-0 bg-transparent gap-6">
                            <TabsTrigger
                                value="orders"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none px-2 pb-3 pt-2"
                            >
                                Order History
                            </TabsTrigger>
                            <TabsTrigger
                                value="cart"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-2 pb-3 pt-2"
                            >
                                Cart Details ({cartItems.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* ORDER HISTORY TAB */}
                        <TabsContent value="orders" className="pt-6">
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-all">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900">{order.productName || "Certification Service"}</h4>
                                                        <p className="text-xs text-slate-500 font-mono">#{order.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={
                                                        order.order_status === "Completed" ? "success" :
                                                            order.order_status === "Pending" ? "warning" : "secondary"
                                                    } className="uppercase text-[10px]">
                                                        {order.order_status || "Pending"}
                                                    </Badge>
                                                    <span className="font-bold text-slate-900">{order.convertedPriceWithSymbol}</span>
                                                </div>
                                            </div>

                                            {/* Order Meta */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 border-t pt-4">
                                                <div>
                                                    <p className="mb-1">Date Placed</p>
                                                    <p className="font-medium text-slate-700">{order.timestamp.toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="mb-1">Category</p>
                                                    <p className="font-medium text-slate-700">{order.category}</p>
                                                </div>
                                                <div>
                                                    <p className="mb-1">Payment Method</p>
                                                    <p className="font-medium text-slate-700 flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3" />
                                                        {order.paymentMethod || "Online"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
                                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">No recent orders</h3>
                                    <p className="text-slate-500">This user hasn't placed any orders yet.</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* CART TAB */}
                        <TabsContent value="cart" className="pt-6">
                            {cartItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cartItems.map((item, i) => (
                                        <div key={i} className="bg-white border rounded-xl p-4 flex gap-4 items-start hover:border-blue-300 transition-colors">
                                            <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                {item.ballImage || item.paddleImage ? (
                                                    <img
                                                        src={item.ballImage || item.paddleImage}
                                                        alt="Product"
                                                        className="h-full w-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <ShoppingCart className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-900 truncate">{item.productName || item.testType || "Verified Item"}</h4>
                                                <p className="text-sm text-slate-500 mb-2">{item.category}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-xs text-slate-400">Qty: {item.quantity || 1}</span>
                                                    <span className="font-bold text-slate-900">₹{item.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
                                    <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">Cart is empty</h3>
                                    <p className="text-slate-500">No items currently in the cart.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
