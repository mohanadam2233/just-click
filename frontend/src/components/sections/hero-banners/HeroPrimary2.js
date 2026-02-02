import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import PopupVideo from "@/components/shared/popup/PopupVideo";
import Image from "next/image";
import blogImage7 from "@/assets/images/blog/blog_7.png";

const HeroPrimary2 = ({ type }) => {
  return (
    <section data-aos="fade-up">
      {/* banner section */}
      <div
        className={`bg-lightGrey10 dark:bg-lightGrey10-dark relative z-0 overflow-y-visible ${
          type === 3 ? "pt-50px" : "py-50px"
        }`}
      >
        {/* animated icons */}
        <div>
          <BookImage type={"secondary"} />
          <GlobImage type={"secondary"} />
          <BalbImage type={"secondary"} />
          <TriangleImage type={"secondary"} />
        </div>
        <div className="container">
          <div>
            <ul className="flex gap-1">
              <li>
                <a
                  href="index.html"
                  className="text-lg text-blackColor2 dark:text-blackColor2-dark"
                >
                  Home <i className="icofont-simple-right"></i>
                </a>
              </li>
              <li>
                <span className="text-lg text-blackColor2 dark:text-blackColor2-dark">
                  Course-Details
                </span>
              </li>
            </ul>
            <div className="pt-70px">
              <div
                className="flex items center gap-6 mb-30px"
                data-aos="fade-up"
              >
                <button className="text-sm text-whiteColor bg-primaryColor border border-primaryColor px-26px py-0.5 leading-23px font-semibold hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor">
                  Featured
                </button>
                <button className="text-sm text-whiteColor bg-indigo border border-indigo px-22px py-0.5 leading-23px font-semibold hover:text-indigo hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-indigo">
                  Ux Design
                </button>
              </div>
              {/* titile */}
              <h4
                className="text-size-32 md:text-4xl font-bold text-blackColor dark:text-blackColor-dark mb-15px leading-43px md:leading-14.5"
                data-aos="fade-up"
              >
                Making Music with Other People
              </h4>
              {/* price and rating */}
              <div
                className="flex gap-5 flex-wrap items-center mb-30px"
                data-aos="fade-up"
              >
                <div className="flex items-center">
                  <div>
                    <i className="icofont-book-alt pr-5px text-primaryColor text-sm"></i>
                  </div>
                  <div>
                    <span className="text-sm text-black dark:text-blackColor-dark font medium">
                      23 Lesson
                    </span>
                  </div>
                </div>
                <div className="text-start md:text-end">
                  <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                  <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                  <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                  <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                  <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                  <span className="text-xs text-blackColor dark:text-blackColor-dark">
                    (44)
                  </span>
                </div>
                <div>
                  <p className="text-sm text-contentColor dark:text-contentColor-dark font-medium">
                    Last Update:{" "}
                    <span className="text-blackColor dark:text-blackColor-dark">
                      Sep 29, 2024
                    </span>
                  </p>
                </div>
              </div>

              {/* thumbnail */}
              {type === 3 ? (
                <div className="overflow-hidden relative mb-5">
                  <Image src={blogImage7} alt="" className="w-full" />
                  <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
                    <PopupVideo />
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPrimary2;
