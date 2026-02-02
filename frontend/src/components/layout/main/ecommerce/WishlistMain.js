import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import WishlistPrimary from "@/components/sections/wishlist/WishlistPrimary";
import React from "react";

const WishlistMain = () => {
  return (
    <>
      <HeroPrimary path={"Wishlist"} title={"Wishlist"} />
      <WishlistPrimary />
    </>
  );
};

export default WishlistMain;
