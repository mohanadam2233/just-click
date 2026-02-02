"use client";
import { useState } from "react";

const useTab = (intialIdx) => {
  const [currentIdx, setCurrentIdx] = useState(intialIdx || 0);
  // handle clicking event
  const handleTabClick = (idx) => {
    setCurrentIdx(idx);
  };
  return { handleTabClick, currentIdx, setCurrentIdx };
};

export default useTab;
