"use client";

import { usePathname } from "next/navigation";
import Navbar from "./nav";
import Footer from "./footer";
import path from "path";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
// const hideNavAndFooter = pathname.startsWith("/auth");  
const hideNavAndFooter = pathname === "/login" || pathname === "/register" || pathname === "/reset-password" || pathname === "/forgot-password";

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main>{children}</main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}