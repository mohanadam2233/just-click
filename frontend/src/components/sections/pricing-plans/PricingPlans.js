"use client";
import HeadingPrimary from "@/components/shared/headings/HeadingPrimary";
import SectionName from "@/components/shared/section-names/SectionName";
import React from "react";
import freeImage from "@/assets/images/icon/price__1.png";
import freeImage2 from "@/assets/images/icon/price__2.png";
import freeImage3 from "@/assets/images/icon/price__3.png";
import PricingPlan from "./PricingPlan";
import useIsTrue from "@/hooks/useIsTrue";
const PricingPlans = () => {
  const isHome10 = useIsTrue("/home-10");
  const isHome10Dark = useIsTrue("/home-10-dark");
  const isHome11 = useIsTrue("/home-11");
  const isHome11Dark = useIsTrue("/home-11-dark");
  const plans = [
    {
      name: "free",
      price: 0,
      moto: "Perfect for startup",
      image: freeImage,
      features: [
        {
          name: "2 user",
          mark: "mark-secondary",
        },
        {
          name: "Learning Scope",
          mark: "mark-secondary",
        },
        {
          name: "Team collaboration",
          mark: "cross",
        },
        {
          name: "Export HTML code",
          mark: "mark",
        },
        {
          name: "Upload Your Logo",
          mark: "mark-secondary",
        },
      ],
    },
    {
      name: "basic",
      price: 29,
      moto: "Perfect for startup",
      image: freeImage2,
      features: [
        {
          name: " 5 user",
          mark: "mark-secondary",
        },
        {
          name: "Learning Scope",
          mark: "mark-secondary",
        },
        {
          name: "Team collaboration",
          mark: "cross",
        },
        {
          name: "Export HTML code",
          mark: "mark",
        },
        {
          name: "Upload Your Logo",
          mark: "mark-secondary",
        },
      ],
    },
    {
      name: "pro",
      price: 59,
      moto: "Perfect for startup",
      image: freeImage3,
      features: [
        {
          name: "10 user",
          mark: "mark-secondary",
        },
        {
          name: "Learning Scope",
          mark: "mark-secondary",
        },
        {
          name: "Team collaboration",
          mark: "cross",
        },
        {
          name: "Export HTML code",
          mark: "mark",
        },
        {
          name: "Upload Your Logo",
          mark: "mark-secondary",
        },
      ],
    },
  ];
  return (
    <section>
      <div
        className={`container  pb-100px ${
          isHome10 || isHome10Dark
            ? ""
            : isHome11 || isHome11Dark
            ? "pt-50px md:pt-30px lg:pt-5 2xl:pt-50px"
            : "pt-90px"
        }`}
      >
        {/* heading */}

        <div className="mb-5 md:mb-10">
          <div className="relative" data-aos="fade-up">
            <div>
              <div className="text-center">
                <SectionName>Pricing Plan</SectionName>
              </div>
            </div>
            <HeadingPrimary text="center">
              Choose The Best Package <br />
              For your Learning
            </HeadingPrimary>
          </div>
        </div>

        {/* plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30px">
          {plans.map((plan, idx) => (
            <PricingPlan key={idx} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
