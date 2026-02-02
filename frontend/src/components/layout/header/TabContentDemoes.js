import home1 from "@/assets/images/mega/home-1.png";
import home2 from "@/assets/images/mega/home-2.png";
import home3 from "@/assets/images/mega/home-3.png";
import home4 from "@/assets/images/mega/home-4.png";
import home5 from "@/assets/images/mega/home-5.png";
import home6 from "@/assets/images/mega/home-6.png";
import home7 from "@/assets/images/mega/home-7.png";
import home8 from "@/assets/images/mega/home-8.png";
import home9 from "@/assets/images/mega/home-9.png";
import home10 from "@/assets/images/mega/home-10.png";
import home11 from "@/assets/images/mega/home-11.png";
import comming from "@/assets/images/mega/coming.png";
import homeDark1 from "@/assets/images/mega/home-1-dark.png";
import homeDark2 from "@/assets/images/mega/home-2-dark.png";
import homeDark3 from "@/assets/images/mega/home-3-dark.png";
import homeDark4 from "@/assets/images/mega/home-4-dark.png";
import homeDark5 from "@/assets/images/mega/home-5-dark.png";
import homeDark6 from "@/assets/images/mega/home-6-dark.png";
import homeDark7 from "@/assets/images/mega/home-7-dark.png";
import homeDark8 from "@/assets/images/mega/home-8-dark.png";
import homeDark9 from "@/assets/images/mega/home-9-dark.png";
import homeDark10 from "@/assets/images/mega/home-10-dark.png";
import homeDark11 from "@/assets/images/mega/home-11-dark.png";
import commingDark from "@/assets/images/mega/coming-dark.png";
import Image from "next/image";
import Link from "next/link";
const TabContentDemoes = ({ isDark }) => {
  const demoes = [
    {
      name: "Home (Default)",
      path: isDark ? "/home-1-dark" : "/",
      image: isDark ? homeDark1 : home1,
      status: null,
    },
    {
      name: "Home (Elegant)",
      path: isDark ? "/home-2-dark" : "/home-2",
      image: isDark ? homeDark2 : home2,
      status: null,
    },
    {
      name: "Home (Classic)",
      path: isDark ? "/home-3-dark" : "/home-3",
      image: isDark ? homeDark3 : home3,
      status: null,
    },
    {
      name: "Home (Classic LMS)",
      path: isDark ? "/home-4-dark" : "/home-4",
      image: isDark ? homeDark4 : home4,
      status: null,
    },
    {
      name: "Home (Online Course)",
      path: isDark ? "/home-5-dark" : "/home-5",
      image: isDark ? homeDark5 : home5,
      status: null,
    },
    {
      name: "NewHome (Marketplace)",
      path: isDark ? "/home-6-dark" : "/home-6",
      image: isDark ? homeDark6 : home6,
      status: "New",
    },
    {
      name: "NewHome (University)",
      path: isDark ? "/home-7-dark" : "/home-7",
      image: isDark ? homeDark7 : home7,
      status: "New",
    },
    {
      name: "Home (eCommerce)",
      path: isDark ? "/home-8-dark" : "/home-8",
      image: isDark ? homeDark8 : home8,
      status: "New",
    },
    {
      name: "Home (Kindergarten)",
      path: isDark ? "/home-9-dark" : "/home-9",
      image: isDark ? homeDark9 : home9,
      status: null,
    },
    {
      name: "NewHome (Machine Learning)",
      path: isDark ? "/home-10-dark" : "/home-10",
      image: isDark ? homeDark10 : home10,
      status: "New",
    },
    {
      name: "NewHome (Single Course)",
      path: isDark ? "/home-11-dark" : "/home-11",
      image: isDark ? homeDark11 : home11,
      status: "New",
    },
    {
      name: "Layout Coming Soon 1",
      path: "#",
      image: isDark ? commingDark : comming,
      status: null,
    },
    {
      name: "Layout Coming Soon 2",
      path: "#",
      image: isDark ? commingDark : comming,
      status: null,
    },
    {
      name: "Layout Coming Soon 3",
      path: "#",
      image: isDark ? commingDark : comming,
      status: null,
    },
    {
      name: "Layout Coming Soon 4",
      path: "#",
      image: isDark ? commingDark : comming,
      status: null,
    },
  ];
  return (
    <div
      id="light-demos"
      className="block opacity-100 transition-opacity duration-150 ease-linear"
    >
      <ul id="light-list" className="grid grid-cols-5 gap-30px pt-30px pb-15px">
        {demoes?.map(({ image, name, path, status }, idx) => (
          <li key={idx}>
            <Link
              href={path}
              className="overflow-hidden group/light relative block shadow-dropdown-card hover:shadow-dropdown-card-hover hover:-translate-y-[5px] rounded-standard dark:shadow-dropdown-card-dark"
            >
              <Image prioriy="false" placeholder="blur" src={image} alt="" />
              {status && (
                <span className="bg-secondaryColor text-xs px-15px py-5px leading-1 text-white absolute top-5px left-5px rounded-standard">
                  {status}
                </span>
              )}
              <span className="absolute left-0 w-full top-full group-hover/light:-translate-y-full bg-primaryColor text-sm leading-[1] p-10px text-center font-semibold text-whiteColor">
                {name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabContentDemoes;
