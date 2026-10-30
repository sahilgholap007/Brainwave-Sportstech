"use client"
import { useEffect, useState } from "react"
import { auth } from "@/firebase/firebaseconfig"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, LogOut, Menu, X, ChevronLeft, ChevronRight, ImageIcon, BarChart3, FileText, Users, FileDown, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminDashboardLayout({ children }) {
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [user, setUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        let isMounted = true;

        const checkAdminAuth = async () => {
            try {
                // Wait for Firebase Auth persistence to restore from IndexedDB
                if (auth.authStateReady) {
                    await auth.authStateReady();
                }

                const currentUser = auth.currentUser;
                if (!currentUser) {
                    if (isMounted) {
                        const redirectPath = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
                        router.push(redirectPath);
                    }
                    return;
                }

                // Server-side admin verification
                const token = await currentUser.getIdToken();
                const res = await fetch("/api/admin/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!isMounted) return;

                if (res.ok) {
                    setUser(currentUser);
                    setIsCheckingAuth(false);
                } else {
                    // Server rejected — authenticated user is not an admin
                    console.warn("User is not an authorized admin, redirecting to home");
                    router.push("/?error=not_admin");
                }
            } catch (error) {
                console.error("Admin verification failed:", error);
                if (isMounted) {
                    router.push("/login");
                }
            }
        };

        checkAdminAuth();

        // Listen for sign-out from other tabs or actions
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser && isMounted) {
                router.push(`/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [router, pathname]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("user");
        } catch (error) {
            console.error("Logout error:", error);
        }
        router.push("/");
    };

    const navItems = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Statistics",
            href: "/admin/statistics",
            icon: BarChart3,
        },
        {
            name: "User Management",
            href: "/admin/users",
            icon: Users,
        },
        {
            name: "Process Orders",
            href: "/admin/process-orders",
            icon: Package,
        },
        {
            name: "Requested Invoices",
            href: "/admin/requested-invoices",
            icon: Receipt,
        },
        {
            name: "Independent Invoice",
            href: "/admin/independent-invoice",
            icon: FileText,
        },
        {
            name: "Manage Logos",
            href: "/admin/manage-logos",
            icon: ImageIcon,
        },
        {
            name: "Manage Blogs",
            href: "/admin/manage-blogs",
            icon: FileText,
        },
        {
            name: "AIPA Report",
            href: "/admin/aipa-report",
            icon: FileDown,
        },
    ];

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-[80px] md:top-[96px] z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-[80px] md:mt-[96px]"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 ease-in-out shadow-2xl",
                    "top-0 pt-20 md:pt-24", // Start at top, add padding to clear global Navbar
                    "z-40", // Below main navbar (z-50) and above overlay (z-30)
                    // Mobile behavior
                    "lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop width
                    sidebarCollapsed ? "lg:w-20" : "lg:w-64",
                    // Mobile width
                    "w-64",
                    "h-screen"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Header */}
                    <div className={cn(
                        "p-6 border-b border-slate-700 transition-all duration-300 bg-slate-900/50",
                        sidebarCollapsed && "lg:p-4",
                        "hidden lg:block" // Hide on mobile, show on desktop
                    )}>
                        {!sidebarCollapsed ? (
                            <div className="flex items-center gap-3">
                                <div>
                                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                                    <p className="text-xs text-slate-400 mt-1">Brainwave SportsTech</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="Brainwave SportsTech"
                                    className="h-10 w-10 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <div className="hidden lg:flex justify-end p-2 border-b border-slate-700 bg-slate-900/30">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
                                        sidebarCollapsed && "lg:justify-center lg:px-2"
                                    )}
                                    title={sidebarCollapsed ? item.name : ""}
                                >
                                    <Icon className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                                        isActive && "text-white"
                                    )} />
                                    <span className={cn(
                                        "transition-all duration-300 font-medium",
                                        sidebarCollapsed && "lg:hidden"
                                    )}>
                                        {item.name}
                                    </span>
                                    {isActive && !sidebarCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                        {!sidebarCollapsed && (
                            <div className="mb-3 px-2 py-2 bg-slate-800/50 rounded-lg">
                                <p className="text-xs font-medium text-slate-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className={cn(
                                "w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-400 hover:text-red-300 hover:bg-red-600/20 border-red-600/30 hover:border-red-500/50 transition-all",
                                sidebarCollapsed && "lg:px-2"
                            )}
                            title={sidebarCollapsed ? "Logout" : ""}
                        >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            <span className={cn(
                                "transition-all duration-300 font-medium",
                                sidebarCollapsed && "lg:hidden"
                            )}>
                                Logout
                            </span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn(
                "transition-all duration-300 min-h-[calc(100vh-6rem)] relative",
                sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                <main className="py-6 px-4 sm:px-6 lg:px-8 bg-transparent">
                    {children}
                </main>
            </div>
        </div>
    )
}
