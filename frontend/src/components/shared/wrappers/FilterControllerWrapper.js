"use client";
import filter from "@/libs/filter";
import { useEffect } from "react";

const FilterControllerWrapper = ({ children }) => {
  useEffect(() => {
    filter();
  }, []);
  return children;
};

export default FilterControllerWrapper;
