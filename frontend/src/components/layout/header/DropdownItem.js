import React from "react";
import DropdownLink from "./DropdownLink";
import DropdownWrapperPrimary from "@/components/shared/wrappers/DropdownWrapperPrimary";
import DropdownPrimary from "./DropdownPrimary";

const DropdownItem = ({ item }) => {
  const { name, status, type, dropdown, path } = item;
  return (
    <li className={`${dropdown ? "relative group/nested" : ""}`}>
      <DropdownLink item={item} />

      {dropdown && (
        <DropdownWrapperPrimary>
          <DropdownPrimary items={dropdown} />
        </DropdownWrapperPrimary>
      )}
    </li>
  );
};

export default DropdownItem;
