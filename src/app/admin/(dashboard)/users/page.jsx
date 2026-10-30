"use client"
import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, ShoppingCart, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Parallel Fetch: Users & Orders
            // We need orders to calculate stats per user efficiently without N+1 queries
            const [usersSnapshot, ordersSnapshot] = await Promise.all([
                getDocs(collection(db, "users")),
                getDocs(collection(db, "certification_orders"))
            ])

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const ordersList = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                let parsedDate = new Date();
                if (data.timestamp) {
                    if (data.timestamp.toDate) parsedDate = data.timestamp.toDate();
                    else if (data.timestamp.seconds) parsedDate = new Date(data.timestamp.seconds * 1000);
                    else parsedDate = new Date(data.timestamp);
                }
                return {
                    id: doc.id,
                    ...data,
                    timestamp: parsedDate
                }
            })

            setUsers(usersList)
            setOrders(ordersList)
        } catch (error) {
            console.error("Error fetching users data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Users
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            (user.displayName && user.displayName.toLowerCase().includes(s)) ||
            (user.email && user.email.toLowerCase().includes(s)) ||
            (user.phoneNumber && user.phoneNumber.includes(s)) ||
            (user.id && user.id.toLowerCase().includes(s))
        );
    });

    // Helper to get order count for a user (match by ID or Email for legacy orders)
    const getOrderCount = (user) => orders.filter(o => o.userId === user.id || (o.email && user.email && o.email === user.email)).length

    // Helper to get cart count
    const getCartCount = (user) => (user.cart || []).length

    const syncUsers = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/sync-users', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                alert(`Sync Complete! Created ${data.stats.created} new user records.`)
                fetchData() // Refresh list
            } else {
                alert(`Sync Failed: ${data.error}`)
            }
        } catch (e) {
            console.error(e)
            alert("Error syncing users.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader mb-4 border-t-purple-600"></div>
                    <p className="text-slate-600">Loading user database...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <span className="text-slate-900">User</span>
                        <span className="text-purple-600">Management</span>
                    </h1>
                    <p className="text-slate-600 mt-1">Manage registered users, inspect carts, and view history.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Sync Button */}
                    <Button onClick={syncUsers} variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Users className="h-4 w-4" /> Sync Users from Auth
                    </Button>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9 border-none bg-transparent focus-visible:ring-0 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Users</p>
                                <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Carts</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {users.filter(u => (u.cart || []).length > 0).length}
                                </h3>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Add more stats if needed */}
            </div>

            {/* Users Table */}
            <Card className="shadow-md border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <CardTitle className="text-lg text-slate-800">Registered Users</CardTitle>
                    <CardDescription>Click on a row to view detailed profile and cart.</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-center">Orders</th>
                                <th className="px-6 py-4 text-center">Cart</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const cartCount = getCartCount(user)
                                    const orderCount = getOrderCount(user)

                                    return (
                                        <tr
                                            key={user.id}
                                            onClick={() => router.push(`/admin/users/${user.id}`)}
                                            className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{user.displayName || "No Name"}</div>
                                                        <div className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0, 6)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div>{user.email}</div>
                                                <div className="text-xs text-slate-400">{user.phoneNumber || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {orderCount > 0 ? (
                                                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                                        {orderCount}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {cartCount > 0 ? (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                        {cartCount} Items
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {user.createdAt ? (
                                                user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : 
                                                user.createdAt.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
                                                new Date(user.createdAt).toLocaleDateString()
                                            ) : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100">
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


        </div>
    )
}
