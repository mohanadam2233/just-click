"use client";

import useIsTrue from "@/hooks/useIsTrue";

const DropdownContainer = ({ children }) => {
  const isHome1 = useIsTrue("/");
  const isHome1Dark = useIsTrue("/home-1-dark");
  const isHome2 = useIsTrue("/home-2");
  const isHome2Dark = useIsTrue("/home-2-dark");
  const isHome4 = useIsTrue("/home-4");
  const isHome4Dark = useIsTrue("/home-4-dark");
  const isHome5 = useIsTrue("/home-5");
  const isHome5Dark = useIsTrue("/home-5-dark");
  return (
    <div
      className={`${
        isHome1 ||
        isHome1Dark ||
        isHome4 ||
        isHome4Dark ||
        isHome5 ||
        isHome5Dark
          ? "lg:container 3xl:container2-lg"
          : isHome2 || isHome2Dark
          ? "container sm:container-fluid lg:container 3xl:container-secondary "
          : "lg:container 3xl:container-secondary-lg "
      } 4xl:container w-2000 shadow-dropdown px-30px mx-auto xl:px-30px py-30px rounded-standard bg-white dark:bg-whiteColor-dark overflow-y-auto max-h-dropdown`}
    >
      {children}
    </div>
  );
};

export default DropdownContainer;
