import Error1 from "@/components/sections/error/Error1";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const ErrorMain = () => {
  return (
    <>
      <HeroPrimary path={"Error Page"} title={"Error Page"} />
      <Error1 />
    </>
  );
};

export default ErrorMain;
