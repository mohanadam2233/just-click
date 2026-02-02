import Image from "next/image";
import herobannerImage5 from "@/assets/images/herobanner/herobanner__5.png";

const TriangleImage = ({ type }) => {
  return (
    <Image
      className={`absolute ${
        type === "secondary"
          ? "right-[30px] top-[212px] md:right-10 md:top-[157px] lg:right-[45px] lg:top-[100px]"
          : "top-0 right-0 md:right-[110px] md:top-[100px] lg:right-[13px] lg:top[90px] 2xl:right-[82px] 2xl:top-[100px] 3xl:right-[110px]"
      } animate-move-hor z-10`}
      src={herobannerImage5}
      alt=""
    />
  );
};

export default TriangleImage;
