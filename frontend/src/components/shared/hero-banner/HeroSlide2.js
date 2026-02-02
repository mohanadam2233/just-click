import React from "react";
import HreoName from "../section-names/HreoName";

const HeroSlide2 = ({ slide, idx }) => {
  const { title, tag } = slide;
  return (
    <div
      className={`hero ${
        idx === 0
          ? "bg-[url('../assets/images/herobanner/university_1.jpg')]"
          : idx === 1
          ? "bg-[url('../assets/images//herobanner/university_2.jpg')]"
          : "bg-[url('../assets/images/herobanner/university_3.jpg')]"
      } relative z-0`}
    >
      <div className="bg-black bg-opacity-70 overflow-hidden pt-50px pb-100px md:pt-35 md:pb-170px lg:pt-100px lg:pb-150px 2xl:pt-35 2xl:pb-170px">
        <div className="container 2xl:container-secondary-md relative overflow-hidden text-center">
          <div data-aos="fade-up">
            <div>
              <HreoName>{tag}</HreoName>

              <h1 className="text-size-35 md:text-size-50 lg:text-5xl 2xl:text-size-75 leading-42px md:leading-15 lg:leading-14 2xl:leading-90px text-whiteColor md:tracking-half lg:tracking-normal 2xl:tracking-half font-bold mb-5 md:mb-50px">
                {title}
              </h1>

              <div>
                <a
                  href="#"
                  className="text-whiteColor bg-primaryColor border border-primaryColor px-10 py-15px hover:text-primaryColor hover:bg-whiteColor rounded-full inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor"
                >
                  More about university
                </a>
              </div>
              <div className="mt-20 md:mt-50px">
                <p className="text-whiteColor mb-15px">Followed by :</p>
                <ul className="flex gap-3 items-center justify-center">
                  <li>
                    <a
                      href="#"
                      className="w-50px h-50px md:w-15 md:h-15 leading-50px md:leading-15 text-whiteColor bg-white bg-opacity-10 hover:bg-primaryColor text-sm md:text-xl rounded-100"
                    >
                      <i className="icofont-facebook"></i>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="w-50px h-50px md:w-15 md:h-15 leading-50px md:leading-15 text-whiteColor bg-white bg-opacity-10 hover:bg-primaryColor text-sm md:text-xl rounded-100"
                    >
                      <i className="icofont-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="w-50px h-50px md:w-15 md:h-15 leading-50px md:leading-15 text-whiteColor bg-white bg-opacity-10 hover:bg-primaryColor text-sm md:text-xl rounded-100"
                    >
                      <i className="icofont-vimeo"></i>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="w-50px h-50px md:w-15 md:h-15 leading-50px md:leading-15 text-whiteColor bg-white bg-opacity-10 hover:bg-primaryColor text-sm md:text-xl rounded-100"
                    >
                      <i className="icofont-linkedin"></i>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="w-50px h-50px md:w-15 md:h-15 leading-50px md:leading-15 text-whiteColor bg-white bg-opacity-10 hover:bg-primaryColor text-sm md:text-xl rounded-100"
                    >
                      <i className="icofont-skype"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlide2;
