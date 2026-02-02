"use client";
import counter1 from "@/assets/images/counter/counter__1.png";
import counter2 from "@/assets/images/counter/counter__2.png";
import counter3 from "@/assets/images/counter/counter__3.png";
import counterUp from "@/libs/counterup";
import Image from "next/image";
import React, { useEffect } from "react";

const Counter3 = () => {
  const items = [
    {
      name: "Got Hired",
      image: counter1,
      data: 27,
      symbol: "+",
    },
    {
      name: "Required",
      image: counter2,
      data: 145,
      symbol: "+",
    },
    {
      name: "Enrolled",
      image: counter3,
      data: 10,
      symbol: "k",
    },
  ];
  useEffect(() => {
    counterUp();
  }, []);

  return (
    <div className="counter flex flex-wrap lg:pt-30px gap-y-30px lg:gap-y-0">
      {items.map(({ image, data, name, symbol }, idx) => (
        <div
          key={idx}
          className="basis-full sm:basis-1/2 lg:basis-1/3"
          data-aos="fade-up"
        >
          <div className="flex gap-4">
            <div>
              <Image src={image} alt="" />
            </div>
            <div>
              <p className="text-size-34 leading-[1.1] text-blackColor font-bold font-hind dark:text-blackColor-dark">
                <span data-countup-number={data}> {data}</span>
                <span>{symbol}</span>
              </p>
              <p className="uppercase text-blackColor font-medium leading-[18px] dark:text-blackColor-dark">
                {name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Counter3;
