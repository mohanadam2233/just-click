import Image from "next/image";
import Link from "next/link";
import React from "react";

const EventsTabItem = ({ event, idx }) => {
  const { image, title, duration, speaker, id } = event;
  return (
    <div
      className={`flex ${
        idx % 2 === 0
          ? "flex-col md:flex-row "
          : "flex-col-reverse md:flex-row-reverse md:pl-45px justify-between"
      } md:gap-30px lg:gap-10 items-center md:items-star bg-whiteColor dark:whiteColor-dark p-15px md:p-5 transition-all duration-300 group hover:text-whiteColor hover:bg-primaryColor dark:bg-whiteColor-dark dark:hover:bg-primaryColor shadow-experience rounded`}
      data-aos="fade-up"
    >
      {/* event thumb */}

      <div className="flex-shrink-0">
        <Image src={image} alt="" className="w-170px" placeholder="blur" />
      </div>
      {/* event content */}
      <div className="py-18px">
        <div>
          <p className="text-sm text-blackColor mb-10px group-hover:text-whiteColor dark:text-blackColor-dark dark:group-hover:text-whiteColor">
            <i className="icofont-clock-time text-primaryColor pr-1 group-hover:text-whiteColor dark:hover:text-whiteColor"></i>
            <span className="pr-2">{duration}</span>
            <span className="text-primaryColor group-hover:text-whiteColor dark:group-hover:text-whiteColor">
              {speaker}
            </span>
            <span>- Event Speaker</span>
          </p>
        </div>
        <h3 className="text-size-15 md:text-lg lg:text-2xl text-contentColor dark: font-semibold pb-18px group-hover:text-whiteColor dark:text-contentColor-dark dark:group-hover:text-whiteColor">
          <Link
            href={`/events/${id}`}
            className="hover:text-secondaryColor dark:hover:text-secondaryColor"
          >
            {title}
          </Link>
        </h3>
        <p className="text-base md:text-sm lg:text-base text-blackColor group-hover:text-whiteColor dark:text-blackColor-dark dark:group-hover:text-whiteColor">
          <Link
            className="hover:text-secondaryColor dark:hover:text-secondaryColor"
            href={`/events/${id}`}
          >
            Read More
            <i className="icofont-simple-right"></i>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EventsTabItem;
