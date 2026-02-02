import Faq from "@/components/sections/faq/Faq";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import ZoomMeetingsDetails from "@/components/sections/zoom-meetings-details/ZoomMeetingsDetails";

const ZoomMeetingDetailsMain = () => {
  return (
    <>
      <HeroPrimary
        path={"Zoom Meetings and Webinars"}
        title={"Zoom Meeting Details"}
      />
      <ZoomMeetingsDetails />
      <Faq />
    </>
  );
};

export default ZoomMeetingDetailsMain;
