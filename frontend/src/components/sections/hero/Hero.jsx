import about10 from "@/assets/images/about/about_10.png";
import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HeadingXl from "@/components/shared/headings/HeadingXl";
import HreoName from "@/components/shared/section-names/HreoName";
import TiltWrapper from "@/components/shared/wrappers/TiltWrapper";
import Image from "next/image";

const Hero = () => {
  return (
    <section id="top" data-aos="fade-up">
      <div className="bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden py-50px md:py-100px lg:pt-100px lg:pb-150px 2xl:pt-155px 2xl:pb-250px">
        {/* animated icons */}
        <div>
          <BookImage />
          <GlobImage />
          <BalbImage />
          <AppleImage />
          <TriangleImage />
        </div>

        <div className="container 2xl:container-secondary-md relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-30px">
            {/* Left */}
            <div data-aos="fade-up">
              <HreoName>CENTRALIZED CLASS MATERIALS PORTAL</HreoName>

              <HeadingXl>
                All your course materials — with{" "}
                <span className="text-secondaryColor">AI help</span>.
              </HeadingXl>

              <p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium mb-10 leading-7 max-w-xl">
                Slides, past exams, and announcements organized by semester and
                course. No more WhatsApp digging — study faster, anytime.
              </p>

              <div className="flex flex-wrap gap-4">
                <ButtonPrimary path="/signup">
                  Create free account
                </ButtonPrimary>
                <ButtonPrimary color="secondary" path="/login">
                  Log in
                </ButtonPrimary>

                {/* Optional: a 3rd CTA only if you really want it */}
                {/* <ButtonPrimary color="secondary" path="#features">See features</ButtonPrimary> */}
              </div>

              {/* Trust indicators (no fake numbers) */}
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { icon: "📱", text: "Mobile-friendly" },
                  { icon: "⬇️", text: "Offline downloads" },
                  { icon: "✅", text: "Verified uploads" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-blackColor dark:text-blackColor-dark opacity-70"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div data-aos="fade-up">
              <TiltWrapper>
                <div className="tilt relative z-1">
                  <Image
                    className="w-full"
                    src={about10}
                    alt="Student using the portal"
                    placeholder="blur"
                    priority
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

export default Hero;
