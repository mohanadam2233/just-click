import React from "react";
import FeesItem from "./FeesItem";

const FeesItems = ({ fees }) => {
  const totalPrice = fees.reduce((ac, { price }) => price + ac, 0);
  return (
    <div className="content-wrapper p-10px md:px-30px">
      <ul>
        {fees.map((fee, idx) => (
          <FeesItem
            key={idx}
            fee={{ ...fee, totalPrice: totalPrice }}
            length={fees.length}
            idx={idx}
          />
        ))}
      </ul>
    </div>
  );
};

export default FeesItems;
