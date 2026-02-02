import Image from "next/image";
import missionImage from "@/assets/images/about/mission.jpg";
const OurMissionContent = () => {
  return (
    <div>
      <p className="text-contentColor dark:text-contentColor-dark mb-25px">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have suffered alteration in some form, by injected humour, or
        randomised words look even slightly believable. If you are going to use
        a passage of Lorem Ipsum, you need to be sure there {" isn't  "}
        anything embarrassing hidden in the middle of text. Ipsum generators on
        the Internet tend to repeat predefined chunks as necessary.
      </p>
      <h4 className="text-xl font-medium text-blackColor dark:text-blackCol font-thinor-dark dark:text-blackColor-dark">
        World best education site
      </h4>
      <p className="text-contentColor dark:text-contentColor-dark mb-25px">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have suffered alteration in some form, by injected humour, or
        randomised words which dont look even slightly believable. If you are
        going to useery
      </p>
      <h4 className="text-xl font-medium text-blackColor dark:text-blackCol font-thinor-dark dark:text-blackColor-dark">
        Web and user interface design
      </h4>
      <p className="text-contentColor dark:text-contentColor-dark mb-30px">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have suffered alteration in some form, by injected humour, or
        randomised words which dont look even slightly believable. If you are
        going to useery
      </p>
      <Image src={missionImage} alt="" className="w-full" placeholder="blur" />
    </div>
  );
};

export default OurMissionContent;
