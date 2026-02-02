"use client";
import { usePathname } from "next/navigation";
import NavItems from "./NavItems";
import NavbarLogo from "./NavbarLogo";
import NavbarRight from "./NavbarRight";
import NavItems2 from "./NavItems2";
import useIsTrue from "@/hooks/useIsTrue";
import NavbarTop from "./NavbarTop";
const Navbar = () => {
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
      className={`transition-all duration-500 sticky-header z-medium dark:bg-whiteColor-dark ${
        isHome2 || isHome2Dark
          ? "lg:border-b border-borderColor dark:border-borderColor-dark"
          : ""
      }`}
    >
      <nav>
        <div
          className={`py-15px lg:py-0 px-15px ${
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
          } 4xl:container mx-auto relative`}
        >
          {isHome4 || isHome4Dark || isHome5 || isHome5Dark ? (
            <NavbarTop />
          ) : (
            ""
          )}
          <div className="grid grid-cols-2 lg:grid-cols-12 items-center gap-15px">
            {/* navbar left */}
            <NavbarLogo />
            {/* Main menu */}
            {isHome2Dark ? <NavItems2 /> : <NavItems />}

            {/* navbar right */}
            <NavbarRight isHome2Dark={isHome2Dark} />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
