import useIsSecondary from "@/hooks/useIsSecondary";
import Image from "next/image";
import React from "react";
import logoImage from "@/assets/images/logo/logo_2.png";
import Link from "next/link";
const FooterTopLeft = () => {
  const { isSecondary } = useIsSecondary();

  return (
    <div data-aos="fade-up">
      {isSecondary ? (
        <Link href="#">
          <Image src={logoImage} alt="" />
        </Link>
      ) : (
        <>
          <h4 className="text-4xl md:text-size-25 lg:text-size-40 font-bold text-whiteColor leading-50px md:leading-10 lg:leading-16">
            Still You Need Our{" "}
            <span className="text-primaryColor">Support</span> ?
          </h4>
          <p className="text-whiteColor text-opacity-65">
            Don’t wait make a smart & logical quote here. Its pretty easy.
          </p>
        </>
      )}
    </div>
  );
};

export default FooterTopLeft;
