import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/app/contexts/CartContext";
import RazorpayScriptLoader from "@/components/Razorpayscriptloader";
import ConditionalFooter from "@/components/ConditionalFooter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO Metadata
export const metadata = {
  title: "Brainwave SportsTech | Get Your Pickleball Equipment Certified",
  description:
    "Brainwave SportsTech is the leading authority in pickleball equipment certification. Get your paddles, balls, and gear tested and approved for quality and performance. We are All India Pickleball Association's (AIPA) authorized equipment testing laboratory.",
  keywords:
    "Pickleball certification, Pickleball equipment, Certified pickleball paddles, Pickleball gear testing, Brainwave SportsTech",
  author: "Brainwave SportsTech",
  robots: "index, follow",
  openGraph: {
    title: "Brainwave SportsTech | Get Your Pickleball Equipment Certified",
    description:
      "Brainwave SportsTech specializes in certifying pickleball paddles, balls, and equipment to ensure top performance and compliance with industry standards. We are All India Pickleball Association's (AIPA) authorized equipment testing laboratory.",
    url: "https://brainwavesportstech.com/",
    siteName: "Brainwave SportsTech",
    images: [
      {
        url: "https://brainwavesportstech.com/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Brainwave SportsTech - Certified Pickleball Equipment",
      },
    ],
    type: "website",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Canonical URL for SEO */}
        <link rel="canonical" href="https://brainwavesportstech.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <ErrorBoundary>
            <Navbar />
            <RazorpayScriptLoader />
            <main className="pt-14">
              {children}
            </main>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <ConditionalFooter />
          </ErrorBoundary>
        </CartProvider>
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Brainwave SportsTech",
              url: "https://brainwavesportstech.com",
              logo: {
                "@type": "ImageObject",
                url: "https://brainwavesportstech.com/images/logo.png",
                width: 512,
                height: 512,
              },
              description:
                "Brainwave SportsTech specializes in pickleball equipment certification, ensuring high performance and compliance. We are All India Pickleball Association's (AIPA) authorized equipment testing laboratory.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-901-100-9611",
                contactType: "customer service",
                areaServed: "Worldwide",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
