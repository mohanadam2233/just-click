import CheckoutPrimary from "@/components/sections/checkout/CheckoutPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const CheckoutMain = () => {
  return (
    <>
      <HeroPrimary path={"Checkout"} title={"Checkout"} />
      <CheckoutPrimary />
    </>
  );
};

export default CheckoutMain;
