import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import React from "react";
import aboutImage1 from "@/assets/images/about/about_1.png";
import aboutImage8 from "@/assets/images/about/about_8.png";

import SectionName from "@/components/shared/section-names/SectionName";
import AboutListItem from "@/components/shared/abouts/AboutListItem";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
const About2 = () => {
  const items = [
    { id: 1, title: "Explore a variety of fresh educational teach" },
    { id: 2, title: "Explore a variety of fresh educational teach" },
    { id: 3, title: "Explore a variety of fresh educational teach" },
  ];
  return (
    <section>
      <div className="container">
        {/* about section  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-30px pt-20">
          {/* about left */}
          <div data-aos="fade-up">
            <TiltWrapper>
              <div className="tilt relative">
                <Image
                  className="w-full"
                  src={aboutImage8}
                  alt=""
                  placeholder="blur"
                />
                <Image
                  className="absolute left-0 top-0 lg:top-4 right-0 mx-auto"
                  src={aboutImage1}
                  alt=""
                  placeholder="blur"
                />
              </div>
            </TiltWrapper>
          </div>

          {/* about right */}
          <div data-aos="fade-up" className="pl-0 lg:pl-35px">
            <SectionName>About Us</SectionName>
            <h3 className="text-3xl md:text-size-45 leading-10 md:leading-2xl font-bold text-blackColor dark:text-blackColor-dark pb-25px">
              Welcome to the{" "}
              <span className="relative z-0 after:w-full after:h-[7px] after:bg-secondaryColor after:absolute after:left-0 after:bottom-3 md:after:bottom-5 after:-z-1">
                Online
              </span>{" "}
              Learning Center
            </h3>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6">
              Forging relationships between multi to national Governments and
              global NGOs begins.
            </p>
            <ul className="space-y-5">
              {items.map((item, idx) => (
                <AboutListItem key={idx} item={item} />
              ))}
            </ul>

            <div className="mt-10">
              <ButtonPrimary path="#" arrow={true}>
                More About
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About2;
