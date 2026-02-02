import React from "react";
import DropdownItem from "./DropdownItem";

const DropdownItems = ({ list }) => {
  const { title, items } = list;
  return (
    <div>
      <h3 className="text-lg text-blackColor font-semibold border-b border-borderColor dark:text-blackColor-dark p-10px mb-10px">
        {title}
      </h3>
      <ul>
        {items?.map((item, idx) => (
          <DropdownItem key={idx} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default DropdownItems;
