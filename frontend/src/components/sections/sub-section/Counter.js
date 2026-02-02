"use client";
import CounterItem from "@/components/shared/counter/CounterItem";
import counterUp from "@/libs/counterup";
import { useEffect } from "react";

const Counter = ({ items }) => {
  useEffect(() => {
    counterUp();
  }, []);

  return (
    <div className="counter flex flex-wrap py-[70px] lg:py-20 gap-y-30px lg:gap-y-0">
      {items.map((item, idx) => (
        <CounterItem key={idx} item={item} />
      ))}
    </div>
  );
};

export default Counter;
