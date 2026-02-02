import Image from "next/image";
import aiImage from "@/assets/images/herobanner/herobanner__ai.png";

const AiImage = () => {
  return (
    <Image
      className="absolute left-10 bottom-[10%] animate-move-var opacity-35 -z-1"
      src={aiImage}
      alt=""
      placeholder="blur"
    />
  );
};

export default AiImage;
