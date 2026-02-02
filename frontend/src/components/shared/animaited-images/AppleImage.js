import Image from "next/image";
import herobannerImage4 from "@/assets/images/herobanner/herobanner__4.png";

const AppleImage = () => {
  return (
    <Image
      className="absolute top-20 left-[872px] md:left-[872px] lg:left-[595px] 2xl:left-[872px] hidden md:block animate-move-hor"
      src={herobannerImage4}
      alt=""
    />
  );
};

export default AppleImage;
