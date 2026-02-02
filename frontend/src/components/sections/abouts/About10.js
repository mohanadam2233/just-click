import HeadingPrimaryXl from "@/components/shared/headings/HeadingPrimaryXl ";
import SectionNameSecondary from "@/components/shared/section-names/SectionNameSecondary";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import Image from "next/image";
import certificateImage from "@/assets/images/about/certificate.jpg";
const About10 = () => {
  return (
    <section className="py-50px md:py-70px lg:py-20 2xl:pt-0 2xl:pb-50px">
      <div className="py-10 md:py-10 2xl:py-50px 3xl:py-30 mx-10px md:mx-50px 3xl:mx-150px bg-darkdeep3 dark:bg-darkdeep3-dark shadow-container rounded-5">
        <div className="container">
          {/* about section  */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-30px">
            {/* about left */}
            <div data-aos="fade-up" className={`pb-10px 2xl:pb-0`}>
              <SectionNameSecondary>GET A CERTIFICATE</SectionNameSecondary>
              <HeadingPrimaryXl>
                Welcome to Complete Awesome course.
              </HeadingPrimaryXl>
              <p className="text-sm md:text-base leading-7 text-contentColor dark:text-contentColor-dark mb-6 pl-3 border-l-2 border-primaryColor">
                25+Contrary to popular belief, Lorem Ipsum is not simply random
                text roots in a piece of classical Latin literature from 45 BC
              </p>
              <ul className="space-y-5 mb-3 xl:mb-0">
                <li className="flex items-center group">
                  <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                  <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
                    Explore a variety of fresh educational teach
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
                    Explore a variety of fresh educational teach
                  </p>
                </li>
              </ul>
            </div>
            {/* about right */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt relative z-0">
                  <Image
                    src={certificateImage}
                    alt=""
                    className="w-full rounded-lg2"
                    placeholder="blur"
                  />
                </div>
              </TiltWrapper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About10;
