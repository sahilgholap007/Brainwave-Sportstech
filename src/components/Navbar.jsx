"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ChevronDown, ShoppingCart, Package, Menu, X, Shield } from "lucide-react";
import { auth } from "../firebase/firebaseconfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";

const adminEmails = [
  'admin@brainwavesportstech.com',
  'gholapsahil007@gmail.com',
  'brainwavesportstech@gmail.com',
  'sahil.gholap007@gmail.com'
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOtherServicesOpen, setIsOtherServicesOpen] = useState(false);
  const { cart } = useCart();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (cart.length > 0) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  useEffect(() => {
    // 1. Check local storage cache on mount to avoid auth button flash
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.displayName || parsed.email)) {
          setIsLoggedIn(true);
          setUserInfo({
            displayName: parsed.displayName || parsed.email?.split("@")[0] || "User",
            photoURL: parsed.photoURL || null,
            email: parsed.email || null,
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Synchronize with Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const info = {
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          photoURL: user.photoURL || null,
          email: user.email || null,
          uid: user.uid,
        };
        setUserInfo(info);
        try {
          localStorage.setItem("user", JSON.stringify(info));
        } catch (e) {}
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
        try {
          localStorage.removeItem("user");
        } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleAboutDropdown = () => setIsAboutDropdownOpen(!isAboutDropdownOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setIsAboutDropdownOpen(false);
    setIsMenuOpen(false);
    setIsOtherServicesOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserInfo(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const isAdmin = isLoggedIn && userInfo?.email && adminEmails.includes(userInfo.email.toLowerCase());

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900 shadow-lg" : "bg-slate-900"
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? "h-18" : "h-18"}`}>

          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3" onClick={handleLinkClick}>
              <div className="relative w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 xl:w-20 xl:h-20">
                <Image
                  src="/images/logo.avif"
                  alt="Brainwave SportsTech Logo"
                  fill
                  className="rounded-full object-cover shadow-sm border border-slate-700"
                  sizes="(max-width: 768px) 48px, (max-width: 1280px) 56px, 80px"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-lg md:text-xl font-bold tracking-tight">
                  Brainwave SportsTech
                </h1>
                <p className="text-[#f39c12] text-xs font-semibold tracking-wide">
                  AIPA's Equipment Testing Lab
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link href="/" className={`font-medium transition-colors ${pathname === '/' ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
              Home
            </Link>

            {/* About Dropdown */}
            <div className="relative group">
              <button
                onClick={toggleAboutDropdown}
                onMouseEnter={() => setIsAboutDropdownOpen(true)}
                onMouseLeave={() => setIsAboutDropdownOpen(false)}
                className={`flex items-center gap-1 font-medium transition-colors py-2 ${pathname?.startsWith('/about') ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`}
              >
                About
                <ChevronDown size={16} className={`transition-transform duration-200 ${isAboutDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute left-0 mt-0 w-56 rounded-xl shadow-2xl bg-slate-900 ring-1 ring-white/10 transition-all duration-200 origin-top ${isAboutDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                  }`}
                onMouseEnter={() => setIsAboutDropdownOpen(true)}
                onMouseLeave={() => setIsAboutDropdownOpen(false)}
              >
                <div className="py-2" role="menu">
                  <Link href="/about/Brainwave" className={`block px-4 py-2 text-sm transition-colors ${pathname === '/about/Brainwave' ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Brainwave SportsTech
                  </Link>
                  <Link href="/about/AIPA" className={`block px-4 py-2 text-sm transition-colors ${pathname === '/about/AIPA' ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    AIPA
                  </Link>
                  <Link href="/about/Our-Lab" className={`block px-4 py-2 text-sm transition-colors ${pathname === '/about/Our-Lab' ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Our Tech Visionary
                  </Link>
                </div>
              </div>
            </div>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                onClick={toggleDropdown}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className={`flex items-center gap-1 font-medium transition-colors py-2 ${(pathname?.startsWith('/services') || pathname?.startsWith('/forms')) ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`}
              >
                Services
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute left-0 mt-0 w-64 rounded-xl shadow-2xl bg-slate-900 ring-1 ring-white/10 transition-all duration-200 origin-top ${isDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                  }`}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="py-2" role="menu">
                  <Link href="/forms/pickle-ball-testing/" className={`block px-4 py-2.5 text-sm font-medium border-b border-slate-800 transition-colors ${pathname?.startsWith('/forms/pickle-ball-testing') ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Pickleball Ball Testing
                  </Link>
                  <Link href="/forms/pickle-ball-paddle-testing/" className={`block px-4 py-2.5 text-sm font-medium border-b border-slate-800 transition-colors ${pathname?.startsWith('/forms/pickle-ball-paddle-testing') ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Pickleball Paddle Testing
                  </Link>
                  <Link href="/forms/court-certification/" className={`block px-4 py-2.5 text-sm font-medium border-b border-slate-800 transition-colors ${pathname?.startsWith('/forms/court-certification') ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Court Certification
                  </Link>
                  <Link href="/forms/sports-flooring-certification/" className={`block px-4 py-2.5 text-sm font-medium border-b border-slate-800 transition-colors ${pathname?.startsWith('/forms/sports-flooring-certification') ? "bg-slate-800 text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                    Sports Flooring Certification
                  </Link>

                  {/* Nested Other Services */}
                  <div
                    className="relative group/nested"
                    onMouseEnter={() => setIsOtherServicesOpen(true)}
                    onMouseLeave={() => setIsOtherServicesOpen(false)}
                  >
                    <button className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${pathname?.startsWith('/services/') ? "text-[#f39c12]" : "text-gray-300 hover:bg-slate-800 hover:text-[#f39c12]"}`}>
                      Other Services
                      <ChevronDown size={16} className={`-rotate-90 transition-colors ${pathname?.startsWith('/services/') ? "text-[#f39c12]" : "text-gray-400 group-hover/nested:text-[#f39c12]"}`} />
                    </button>

                    <div className={`absolute top-0 left-full ml-1 w-64 rounded-xl shadow-2xl bg-slate-900 ring-1 ring-white/10 transition-all duration-200 ${isOtherServicesOpen ? "opacity-100 visible" : "opacity-0 invisible"
                      }`}>
                      <div className="py-2">
                        <Link href="/services/testing-and-certification/" className={`block px-4 py-2 text-sm transition-colors ${pathname?.startsWith('/services/testing-and-certification') ? "bg-slate-800 text-[#f39c12]" : "text-gray-400 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                          Testing and Certification
                        </Link>
                        <Link href="/services/failure-analysis/" className={`block px-4 py-2 text-sm transition-colors ${pathname?.startsWith('/services/failure-analysis') ? "bg-slate-800 text-[#f39c12]" : "text-gray-400 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                          Failure Analysis
                        </Link>
                        <Link href="/services/research-and-development/" className={`block px-4 py-2 text-sm transition-colors ${pathname?.startsWith('/services/research-and-development') ? "bg-slate-800 text-[#f39c12]" : "text-gray-400 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                          Research and Development
                        </Link>
                        <Link href="/services/construction-and-certification/" className={`block px-4 py-2 text-sm transition-colors ${pathname?.startsWith('/services/construction-and-certification') ? "bg-slate-800 text-[#f39c12]" : "text-gray-400 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                          Court Construction
                        </Link>
                        <Link href="/services/project-management/" className={`block px-4 py-2 text-sm transition-colors ${pathname?.startsWith('/services/project-management') ? "bg-slate-800 text-[#f39c12]" : "text-gray-400 hover:bg-slate-800 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
                          Project Management
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/blogs" className={`font-medium transition-colors ${pathname?.startsWith('/blogs') ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
              Blogs
            </Link>
            <Link href="/FAQ" className={`font-medium transition-colors ${pathname?.startsWith('/FAQ') ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
              FAQ
            </Link>
            <Link href="/contact" className={`font-medium transition-colors ${pathname?.startsWith('/contact') ? "text-[#f39c12]" : "text-gray-300 hover:text-[#f39c12]"}`} onClick={handleLinkClick}>
              Contact
            </Link>
          </div>

          {/* Desktop Auth / User Actions */}
          <div className="hidden lg:flex lg:items-center lg:space-x-5">
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white font-medium transition-colors" onClick={handleLinkClick}>
                  Log in
                </Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg bg-[#f39c12] text-white text-sm font-semibold hover:bg-[#e67e22] transition-colors shadow-sm" onClick={handleLinkClick}>
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-5">
                <Link href="/my-cart" className={`flex items-center gap-2 text-gray-300 hover:text-[#f39c12] font-medium transition-all duration-300 ${shouldAnimate ? "scale-110" : "scale-100"}`} onClick={handleLinkClick}>
                  <div className="relative">
                    <ShoppingCart size={20} className={shouldAnimate ? "animate-bounce text-[#f39c12]" : ""} />
                    {cart.length > 0 && (
                      <span className={`absolute -top-2 -right-2 bg-[#f39c12] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transition-all duration-300 ${shouldAnimate ? "scale-125" : "scale-100"}`}>
                        {cart.length}
                      </span>
                    )}
                  </div>
                  My Cart
                </Link>
                <Link href="/my-orders" className="flex items-center gap-2 text-gray-300 hover:text-[#f39c12] font-medium transition-colors" onClick={handleLinkClick}>
                  <Package size={18} />
                  My Orders
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white border border-purple-500/30 text-sm font-medium transition-colors"
                    onClick={handleLinkClick}
                  >
                    <Shield size={16} />
                    Admin Panel
                  </Link>
                )}

                <div className="h-6 w-px bg-gray-700 mx-2"></div>

                <div className="flex items-center gap-3 relative group">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-white leading-tight">
                      {userInfo?.displayName || "User"}
                    </span>
                    {/* Logout button visible on hover */}
                    <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <button
                        onClick={handleLogout}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 shadow-xl transition-all whitespace-nowrap"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                  {userInfo?.photoURL ? (
                    <Image
                      src={userInfo.photoURL}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-slate-700 cursor-pointer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border-2 border-slate-600 cursor-pointer">
                      {(userInfo?.displayName || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center pr-2">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#f39c12]"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-out */}
      <div
        className={`fixed inset-y-0 right-0 w-[280px] sm:w-[320px] bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto border-l border-slate-800 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <h2 className="text-white text-lg font-bold">Menu</h2>
            <button onClick={toggleMenu} className="text-gray-400 hover:text-white p-2">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile User Profile (if logged in) */}
          {isLoggedIn && (
            <div className="flex items-center gap-3 mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
              {userInfo?.photoURL ? (
                <Image
                  src={userInfo.photoURL}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                  {(userInfo?.displayName || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white font-semibold truncate max-w-[150px]">{userInfo?.displayName || "User"}</span>
                <button onClick={handleLogout} className="text-xs text-red-400 text-left hover:text-red-300 py-1">Logout</button>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <Link href="/" className={`block px-3 py-3 rounded-lg text-base font-medium ${pathname === '/' ? "text-white bg-slate-800" : "text-gray-300 hover:text-white hover:bg-slate-800"}`} onClick={handleLinkClick}>
              Home
            </Link>

            {/* Mobile About Dropdown */}
            <div className="space-y-1">
              <button
                onClick={toggleAboutDropdown}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                About
                <ChevronDown size={16} className={`transition-transform duration-200 ${isAboutDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isAboutDropdownOpen && (
                <div className="pl-4 space-y-1 bg-slate-950/50 py-2 rounded-lg">
                  <Link href="/about/Brainwave" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Brainwave SportsTech
                  </Link>
                  <Link href="/about/AIPA" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    AIPA
                  </Link>
                  <Link href="/about/Our-Lab" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Our Tech Visionary
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Services Dropdown */}
            <div className="space-y-1">
              <button
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                Services
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="pl-4 space-y-1 bg-slate-950/50 py-2 rounded-lg">
                  <Link href="/forms/pickle-ball-testing/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Pickleball Ball Testing
                  </Link>
                  <Link href="/forms/pickle-ball-paddle-testing/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Pickleball Paddle Testing
                  </Link>
                  <Link href="/forms/court-certification/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Court Certification
                  </Link>
                  <Link href="/forms/sports-flooring-certification/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    Sports Flooring Certification
                  </Link>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Services</span>
                    <Link href="/services/testing-and-certification/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Testing and Certification
                    </Link>
                    <Link href="/services/failure-analysis/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Failure Analysis
                    </Link>
                    <Link href="/services/research-and-development/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Research and Development
                    </Link>
                    <Link href="/services/construction-and-certification/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Court Construction
                    </Link>
                    <Link href="/services/project-management/" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Project Management
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/blogs" className={`block px-3 py-3 rounded-lg text-base font-medium ${pathname?.startsWith('/blogs') ? "text-white bg-slate-800" : "text-gray-300 hover:text-white hover:bg-slate-800"}`} onClick={handleLinkClick}>
              Blogs
            </Link>
            <Link href="/FAQ" className={`block px-3 py-3 rounded-lg text-base font-medium ${pathname?.startsWith('/FAQ') ? "text-white bg-slate-800" : "text-gray-300 hover:text-white hover:bg-slate-800"}`} onClick={handleLinkClick}>
              FAQ
            </Link>
            <Link href="/contact" className={`block px-3 py-3 rounded-lg text-base font-medium ${pathname?.startsWith('/contact') ? "text-white bg-slate-800" : "text-gray-300 hover:text-white hover:bg-slate-800"}`} onClick={handleLinkClick}>
              Contact
            </Link>

            {/* Mobile Auth Links */}
            <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-white border border-slate-700 hover:bg-slate-800 transition-colors" onClick={handleLinkClick}>
                    Log in
                  </Link>
                  <Link href="/signup" className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-white bg-[#f39c12] hover:bg-[#e67e22] transition-colors shadow-md" onClick={handleLinkClick}>
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/my-cart" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-[#f39c12] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            {cart.length}
                          </span>
                        )}
                      </div>
                      My Cart
                    </div>
                  </Link>
                  <Link href="/my-orders" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="block px-3 py-3 rounded-lg text-base font-medium text-purple-400 hover:text-white hover:bg-slate-800" onClick={handleLinkClick}>
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay Backdrop */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleLinkClick}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
