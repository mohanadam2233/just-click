import Image from "next/image";
import herobannerImage2 from "@/assets/images/herobanner/herobanner__2.png";
const GlobImage = ({ type }) => {
  return (
    <Image
      className={`absolute ${
        type === "secondary"
          ? "left-0 top-0 lg:left-[50px] lg:top-[100px]"
          : "left-0 top-0 md:left-[50px] md:top-[110px] lg:left-[30px] lg:top-[75px] 2xl:left-[50px] 2xl:top-16 3xl:top-[110px]"
      }  animate-spin-slow `}
      src={herobannerImage2}
      alt=""
    />
  );
};

export default GlobImage;
