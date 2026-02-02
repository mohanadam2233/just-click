"use client";

import HeroDashboard from "@/components/sections/hero-banners/HeroDashboard";

const DsahboardWrapper = ({ children }) => {
  return (
    <>
      <HeroDashboard />
      {children}
    </>
  );
};

export default DsahboardWrapper;
