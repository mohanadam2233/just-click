import React from "react";

const FeesItem = ({ fee, length, idx }) => {
  const { title, desc, price, isTotalPrice, icon, totalPrice } = fee;

  return (
    <li
      className={`py-18px flex items-center justify-between flex-wrap ${
        idx === length - 1
          ? ""
          : "border-b border-borderColor dark:border-borderColor-dark"
      } `}
    >
      <div>
        <h4 className="text-blackColor dark:text-blackColor-dark font-thin leading-1">
          {icon} <span className="font-medium">{title} : </span>
          {desc}
        </h4>
      </div>
      {price ? (
        <div className="text-blackColor dark:text-blackColor-dark font-thin text-sm">
          <p>
            <i className="icofont-dollar"></i> {price.toFixed(2)}
          </p>
        </div>
      ) : (
        ""
      )}
      {isTotalPrice && (
        <div className="bg-primaryColor text-whiteColor text-sm ml-5 rounded py-0.5">
          <p className="px-10px">
            <i className="icofont-dollar"></i> {totalPrice.toFixed(2)}
          </p>
        </div>
      )}
    </li>
  );
};

export default FeesItem;
