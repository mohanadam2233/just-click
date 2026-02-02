import Image from "next/image";
import herobannerImage3 from "@/assets/images/herobanner/herobanner__3.png";

const BalbImage = ({ type }) => {
  return (
    <Image
      className={`absolute ${
        type === "secondary"
          ? "right-[30px] top-0 md:right-10 lg:right-[575px] 2xl:top-20"
          : "md:left-[210px] md:top-[50px]"
      } animate-move-var2 hidden md:block  z-10`}
      src={herobannerImage3}
      alt=""
    />
  );
};

export default BalbImage;
