import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import Image from "next/image";
import storeImage from "@/assets/images/about/about_online_store.png";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";

const About5 = () => {
  return (
    <section>
      <div className="container">
        {/* about section  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-30px pb-30px">
          {/* about left */}
          <div data-aos="fade-up">
            <SectionNameSecondary>EDUCATION SOLUTION</SectionNameSecondary>
            <HeadingPrimaryXl>
              Welcome to the Online Learning Center
            </HeadingPrimaryXl>
            <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6 pl-3 border-l-2 border-primaryColor">
              25+Contrary to popular belief, Lorem Ipsum is not simply random
              text roots in a piece of classical Latin literature from 45 BC
            </p>
            <ul className="space-y-5">
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Lorem Ipsum is simply dummy
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Explore a variety of fresh educational teach
                </p>
              </li>
              <li className="flex items-center group">
                <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                  Lorem Ipsum is simply dummy text of
                </p>
              </li>
            </ul>
          </div>
          {/* about right */}
          <div className="overflow-visible" data-aos="fade-up">
            <TiltWrapper>
              <div className="tilt">
                <Image
                  src={storeImage}
                  alt=""
                  className="w-full"
                  placeholder="blur"
                />
              </div>
            </TiltWrapper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About5;
