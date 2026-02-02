import Image from "next/image";
import flagImage1 from "@/assets/images/icon/flag1.webp";
import flagImage2 from "@/assets/images/icon/flag2.webp";
import flagImage3 from "@/assets/images/icon/flag3.webp";
import DropdownCart from "./DropdownCart";
import LoginButton from "./LoginButton";
import DropdownWrapper from "@/components/shared/wrappers/DropdownWrapper";

const NavbarTop = () => {
  return (
    <div className="hidden lg:grid grid-cols-12 py-5 pl-15px items-center gap-30px border-b border-borderColor dark:border-borderColor-dark -mx-15px">
      <div className="col-start-1 col-span-3">
        <ul className="flex items-center nav-list">
          <li className="relative group">
            <button className="text-contentColor dark:text-contentColor-dark pr-10px flex items-center">
              <Image
                src={flagImage1}
                alt=""
                className="w-6 h-6 mr-1 rounded-lg2"
              />
              ENG
              <i className="icofont-rounded-down"></i>
            </button>
            {/* dropdown menu  */}
            <DropdownWrapper>
              <div className="shadow-dropdown3 max-w-dropdown2 w-2000 rounded-standard bg-white dark:bg-whiteColor-dark">
                <ul>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-size-13 text-blackColor p-10px transition duration-300 hover:bg-darkdeep4 hover:text-whiteColor dark:text-blackColor-dark dark:hover:text-whiteColor-dark dark:hover:bg-darkdeep4"
                    >
                      <Image
                        src={flagImage2}
                        alt=""
                        className="w-18px h-18px rounded-lg mr-10px"
                      />
                      FR
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-size-13 text-blackColor p-10px transition duration-300 hover:bg-darkdeep4 hover:text-whiteColor dark:text-blackColor-dark dark:hover:text-whiteColor-dark dark:hover:bg-darkdeep4"
                    >
                      <Image
                        src={flagImage3}
                        alt=""
                        className="w-18px h-18px rounded-lg mr-10px"
                      />
                      DE
                    </a>
                  </li>
                </ul>
              </div>
            </DropdownWrapper>
          </li>
          <li className="relative group">
            <button className="text-contentColor dark:text-contentColor-dark pl-10px flex items-center">
              USD
              <i className="icofont-rounded-down"></i>
            </button>
            {/* dropdown menu  */}
            <DropdownWrapper>
              <div className="shadow-dropdown3 max-w-dropdown2 w-2000 rounded-standard bg-white dark:bg-whiteColor-dark">
                <ul>
                  <li>
                    <a
                      href="#"
                      className="w-full text-size-13 text-blackColor p-10px pl-5 transition duration-300 hover:bg-darkdeep4 hover:text-whiteColor dark:text-blackColor-dark dark:hover:text-whiteColor-dark dark:hover:bg-darkdeep4"
                    >
                      FR
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="w-full text-size-13 text-blackColor p-10px pl-5 transition duration-300 hover:bg-darkdeep4 hover:text-whiteColor dark:text-blackColor-dark dark:hover:text-whiteColor-dark dark:hover:bg-darkdeep4"
                    >
                      DE
                    </a>
                  </li>
                </ul>
              </div>
            </DropdownWrapper>
          </li>
        </ul>
      </div>
      <div className="col-start-4 col-span-6">
        <form>
          <div className="text-blackColor dark:text-blackColor-dark py-2 pl-15px border border-borderColor dark:border-borderColor-dark relative rounded-full">
            <input
              type="text"
              placeholder="Search Course"
              className="w-full focus:outline-none bg-transparent placeholder:text-darkdeep4"
            />
            <button
              type="submit"
              className="absolute top-1/2 -translate-y-1/2 right-7"
            >
              <i className="icofont-search-1"></i>
            </button>
          </div>
        </form>
      </div>
      <div className="col-start-10 col-span-3">
        <ul className="relative nav-list flex justify-end items-center">
          <li className="px-5 lg:px-10px 2xl:px-5 group">
            <DropdownCart isHeaderTop={true} />
          </li>
          <li className="hidden lg:block">{<LoginButton />}</li>
        </ul>
      </div>
    </div>
  );
};

export default NavbarTop;
