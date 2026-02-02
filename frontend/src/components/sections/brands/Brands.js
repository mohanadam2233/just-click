import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import React from "react";
import brandImage1 from "@/assets/images/brand/brand_1.png";
import brandImage2 from "@/assets/images/brand/brand_2.png";
import brandImage3 from "@/assets/images/brand/brand_3.png";
import brandImage4 from "@/assets/images/brand/brand_4.png";
import brandImage5 from "@/assets/images/brand/brand_5.png";
import brandImage6 from "@/assets/images/brand/brand_6.png";
import brandImage7 from "@/assets/images/brand/brand_7.png";
import brandImage8 from "@/assets/images/brand/brand_8.png";
import brandImage9 from "@/assets/images/brand/brand_9.png";
import Link from "next/link";
import Image from "next/image";
const Brands = () => {
  const brands = [
    brandImage1,
    brandImage2,
    brandImage3,
    brandImage4,
    brandImage5,
    brandImage6,
    brandImage7,
    brandImage8,
    brandImage9,
  ];
  return (
    <section className="bg-lightGrey10 dark:bg-lightGrey10-dark">
      <div className="container pb-60px">
        {/* Brands Heading  */}
        <div className="mb-5 md:mb-10" data-aos="fade-up">
          <HeadingPrimary text="center">
            Relied on marketers trusted by engineers and <br />
            Beloved by{" "}
            <span className="relative after:w-full after:h-[7px] z-0 after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:z-[-1]">
              Executives
            </span>
          </HeadingPrimary>
        </div>
        {/* brands  */}
        <div className="flex flex-wrap justify-center">
          {brands.map((brand, idx) => (
            <div
              key={idx}
              className="basis-1/2 md:basis-1/4 lg:basis-1/5"
              data-aos="fade-up"
            >
              <Link
                href="#"
                className="pt-25px pb-45px text-center w-full flex justify-center"
              >
                <Image src={brand} alt="" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
