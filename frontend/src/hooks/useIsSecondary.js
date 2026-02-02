import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const useIsSecondary = () => {
  const [isSecondary, setIsSecondary] = useState(false);
  const isHome = (pathName) => {
    const pattern = /\b(?:home-2)\b/;
    return pattern.test(pathName);
  };
  const isMatch = (pathName) => {
    const pattern = /\b(?:dashboards|ecommerce|home-2)\b/;
    return pattern.test(pathName);
  };
  const pathName = usePathname();
  useEffect(() => {
    setIsSecondary(isMatch(pathName));
  }, [pathName]);
  return { isSecondary, isHome };
};

export default useIsSecondary;
