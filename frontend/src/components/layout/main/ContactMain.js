import ContactFrom from "@/components/sections/contact-form/ContactFrom";
import ContactPrimary from "@/components/sections/contact/ContactPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const ContactMain = () => {
  return (
    <>
      <HeroPrimary path={"Contact Page"} title={"Contact Page"} />
      <ContactPrimary />
      <ContactFrom />
    </>
  );
};

export default ContactMain;
