import React from "react";

const VedioContent = () => {
  return (
    <div className="aspect-[16/9]">
      <iframe
        src="https://www.youtube.com/embed/vHdclsdkp28"
        allowFullScreen=""
        allow="autoplay"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default VedioContent;
