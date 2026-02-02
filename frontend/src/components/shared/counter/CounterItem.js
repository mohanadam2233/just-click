import Image from "next/image";
import React from "react";

const CounterItem = ({ item }) => {
  const { name, data, image, symbol } = item;
  return (
    <div className="basis-full sm:basis-1/2 lg:basis-1/4" data-aos="fade-up">
      <div className="flex gap-4">
        <div>
          <Image src={image} alt="" />
        </div>
        <div>
          <h1 className="text-size-34 leading-[1.1] text-blackColor font-bold  dark:text-blackColor-dark">
            <span data-countup-number={data}>{data}</span>
            <span>{symbol}</span>
          </h1>
          <p className="uppercase text-blackColor font-medium leading-[18px] dark:text-blackColor-dark">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CounterItem;
