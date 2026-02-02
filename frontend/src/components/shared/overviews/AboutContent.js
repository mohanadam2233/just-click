"use client";
import Image from "next/image";
import overviewImage from "@/assets/images/about/overview.jpg";
import overviewKidImage from "@/assets/images/about/overview_kg.png";
import useIsTrue from "@/hooks/useIsTrue";
const AboutContent = () => {
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const isAbout = useIsTrue("/about");
  const isAboutDark = useIsTrue("/about-dark");
  return (
    <div>
      <p className="text-contentColor dark:text-contentColor-dark mb-25px">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have suffered alteration in some form, by injected humour, or
        randomised words look even slightly believable. If you are going to use
        a passage of Lorem Ipsum, you need to be sure there {" isn't "} anything
        embarrassing hidden in the middle of text. Ipsum generators on the
        Internet tend to repeat predefined chunks as necessary, making this the
        first true generator on the Internet. It uses a dictionary of over 200
        combined with a handful of model sentence structures, to generate Lorem
        Ipsum which looks reasonable. The generated Lorem Ipsum is therefore
        always free from characteristic words etc.
      </p>
      {isAbout || isAboutDark ? (
        <>
          <h4 className="text-xl font-medium text-blackColor dark:text-blackCol font-thinor-dark dark:text-blackColor-dark">
            World best education site - (Computer engeenering)
          </h4>
          <p className="text-contentColor dark:text-contentColor-dark mb-25px">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which dont look even slightly
            believable. If you are going to useery
          </p>
          <h4 className="text-xl font-medium text-blackColor dark:text-blackCol font-thinor-dark dark:text-blackColor-dark">
            Web and user interface design - Development
          </h4>
          <p className="text-contentColor dark:text-contentColor-dark mb-30px">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which dont look even slightly
            believable. If you are going to useery
          </p>

          <h4 className="text-xl font-medium text-blackColor dark:text-blackCol font-thinor-dark dark:text-blackColor-dark">
            Interaction design - Animation
          </h4>
          <p className="text-contentColor dark:text-contentColor-dark mb-30px">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which dont look even slightly
            believable. If you are going to useery
          </p>
        </>
      ) : (
        <Image
          src={isHome9 || isHome9Dark ? overviewKidImage : overviewImage}
          alt=""
          className="w-full"
          placeholder="blur"
        />
      )}
    </div>
  );
};

export default AboutContent;
