"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import videoImage from "@/assets/images/icon/video.png";
import videoModal from "@/libs/videoModal";
const PopupVideo = () => {
  useEffect(() => {
    videoModal();
  }, []);
  return (
    <div>
      <button
        data-url="https://www.youtube.com/watch?v=vHdclsdkp28"
        className="lvideo relative w-15 h-15 md:h-20 md:w-20 lg:w-15 lg:h-15 2xl:h-70px 2xl:w-70px 3xl:h-20 3xl:w-20 bg-secondaryColor rounded-full flex items-center justify-center"
      >
        <span className="animate-buble absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block w-[180px] h-[180px] border-secondaryColor rounded-full"></span>
        <span className="animate-buble2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block w-[180px] h-[180px] border-secondaryColor rounded-full"></span>
        <Image src={videoImage} alt="" />
      </button>
    </div>
  );
};

export default PopupVideo;
