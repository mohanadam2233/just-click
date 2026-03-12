"use client";

import { usePathname } from "next/navigation";
import HeroDashboard from "@/components/sections/hero-banners/HeroDashboard";

const DsahboardWrapper = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <HeroDashboard />}
      {children}
    </>
  );
};

export default DsahboardWrapper;
