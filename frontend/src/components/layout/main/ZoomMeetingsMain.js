import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import ZoomMeetings from "@/components/sections/zoom-meetings/ZoomMeetings";
import React from "react";

const ZoomMeetingsMain = () => {
  return (
    <>
      <HeroPrimary
        path={"Zoom Meetings and Webinars"}
        title={"Zoom Meetings"}
      />
      <ZoomMeetings />
    </>
  );
};

export default ZoomMeetingsMain;
