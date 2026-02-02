import EventDetails from "@/components/sections/event-details/EventDetails";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const EventDetailsMain = () => {
  return (
    <>
      <HeroPrimary path={"Event Page"} title={"Event Details"} />
      <EventDetails />
    </>
  );
};

export default EventDetailsMain;
