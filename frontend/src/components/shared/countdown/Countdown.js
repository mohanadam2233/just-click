"use client";

import countDown from "@/libs/countdown";
import { useEffect } from "react";

const Countdown = ({ countdown }) => {
  const items = [
    {
      unit: "Days",
      time: 418,
    },
    {
      unit: "Hrs",
      time: 15,
    },
    {
      unit: "Min",
      time: 56,
    },
    {
      unit: "Sec",
      time: 44,
    },
  ];
  useEffect(() => {
    countDown();
  }, []);
  return (
    <div
      className={`countdown flex  items-center  ${
        countdown === "small" ? "gap-[6px] mb-25px" : "gap-5 md:gap-10 mt-50px"
      }`}
      data-countdown="2025/06/01"
    >
      {items?.map(({ unit, time }, idx) => (
        <div
          className={`w-15 h-15 md:w-70px md:h-70px  bg-primaryColor text-whiteColor rounded-lg2 flex flex-col items-center justify-center ${
            countdown === "small" ? "" : "lg:w-20 lg:h-20 3xl:w-30 3xl:h-30"
          }`}
          key={idx}
        >
          <p
            className={`count text-size-15  md:text-lg lg:text-xl   ${
              countdown === "small"
                ? "leading-1"
                : "3xl:text-size-40 md:mb-10px"
            }`}
          >
            {time}
          </p>
          <span
            className={` ${
              countdown === "small"
                ? "text-size-15 md:text-sm lg:text-base leading-1"
                : "text-sm  md:text-xl"
            }`}
          >
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
