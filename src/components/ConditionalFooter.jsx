"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
    const pathname = usePathname();

    // Do not render the footer on admin routes
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return <Footer />;
}
