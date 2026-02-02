const { default: Image } = require("next/image");
import blogImage21 from "@/assets/images/blog/blog_21.png";
import blogImage22 from "@/assets/images/blog/blog_22.png";
import blogImage23 from "@/assets/images/blog/blog_23.png";

import PopupVideo from "@/components/shared/popup/PopupVideo";

import BlogsSidebar from "@/components/shared/blogs/BlogsSidebar";
import Link from "next/link";
import CommentFome from "@/components/shared/forms/CommentFome";

import BlogSocials2 from "@/components/shared/blog-details/BlogSocials2";
import BlogTags2 from "@/components/shared/blog-details/BlogTags2";
import ClientComment from "@/components/shared/blog-details/ClientComment";
import BlogTagsAndSocila from "@/components/shared/blog-details/BlogTagsAndSocila";
const BlogDetails = () => {
  return (
    <section>
      <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
            {/* blog 1 */}
            <div data-aos="fade-up">
              {/* blog thumbnail */}
              <div className="overflow-hidden relative mb-30px">
                <Image src={blogImage21} alt="" className="w-full" />
              </div>
              {/* blog content */}
              <div>
                <p
                  className="text-lg text-darkdeep4 mb-25px !leading-30px"
                  data-aos="fade-up"
                >
                  We have covered many special events such as fireworks, fairs,
                  parades, races, walks, awards ceremonies, fashion shows,
                  sporting events, and even a memorial service.
                </p>

                <p
                  className="text-lg text-darkdeep4 mb-5 !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus. Suspendisse consectetur tristique tortor
                </p>
                <h4
                  className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  Experience is over the world visit
                </h4>
                <p
                  className="text-lg text-darkdeep4 mb-5 !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus
                </p>
                <p
                  className="text-lg text-darkdeep4 mb-30px !leading-30px"
                  data-aos="fade-up"
                >
                  We have covered many special events such as fireworks, fairs,
                  parades, races, walks, awards ceremonies, fashion shows,
                  sporting events, and even a memorial service.
                </p>
                <p
                  className="text-lg text-darkdeep4 mb-35px !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus. Suspendisse consectetur tristique tortor
                </p>
                <div
                  className="pt-55px pr-10 pb-60px pl-70px xs:p-5 sm:pt-55px sm:pr-10 sm:pb-60px sm:pl-70px mb-43px bg-blackColor2 dark:bg-blackColor2-dark text-whiteColor dark:text-whiteColor-dark font-medium relative"
                  data-aos="fade-up"
                >
                  <h5 className="text-size-19 md:text-size-32 lg:text-size-28 2xl:text-size-32 leading-9 md:leading-10 lg:leading-38px 2xl:leading-10 mb-15px">
                    Smashing Podcast Episode With Paul Boag What Is Conversion
                    Optimization
                  </h5>
                  <Link
                    href="#"
                    className="text-size-17 leading-23px relative pl-60px before:w-45px before:h-0.5 before:bg-whiteColor dark:before:bg-whiteColor-dark before:absolute before:left-0 before:top-2/4"
                  >
                    John Mirnsdo
                  </Link>
                  <div
                    className="absolute left-[22%] top-[22%] md:left-[37%] md:top-[14%]"
                    data-aos="fade-up"
                  >
                    <Image src={blogImage22} alt="" />
                  </div>
                </div>

                <h4
                  className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  Experience is over the world visit
                </h4>
                <p
                  className="text-lg text-darkdeep4 mb-30px !leading-30px"
                  data-aos="fade-up"
                >
                  We have covered many special events such as fireworks, fairs,
                  parades, races, walks, awards ceremonies, fashion shows,
                  sporting events, and even a memorial service
                </p>
                <p
                  className="text-lg text-darkdeep4 mb-30px !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus. Suspendisse consectetur tristique tortor
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-30px mb-50px">
                  {/* about left */}
                  <div
                    className="md:col-start-1 md:col-span-4 relative"
                    data-aos="fade-up"
                  >
                    <div>
                      <Image className="w-full" src={blogImage23} alt="" />
                    </div>
                    <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
                      <PopupVideo />
                    </div>
                  </div>
                  {/* video right */}
                  <div
                    data-aos="fade-up"
                    className="md:col-start-5 md:col-span-8"
                  >
                    <h4
                      className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                      data-aos="fade-up"
                    >
                      Why search Is Important ?
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center group">
                        <i className="icofont-check px-0.5 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                        <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-darkdeep4">
                          Lorem Ipsum is simply dummying text of the printing
                          andtypesetting industry most of the standard.
                        </p>
                      </li>
                      <li className="flex items-center group">
                        <i className="icofont-check px-0.5 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                        <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-darkdeep4">
                          Lorem Ipsum is simply dummying text of the printing
                          andtypesetting industry most of the standard.
                        </p>
                      </li>
                      <li className="flex items-center group">
                        <i className="icofont-check px-0.5 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                        <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-darkdeep4">
                          Lorem Ipsum is simply dummying text of the printing
                          andtypesetting industry most of the standard.
                        </p>
                      </li>
                      <li className="flex items-center group">
                        <i className="icofont-check px-0.5 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                        <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-darkdeep4">
                          Lorem Ipsum is simply dummying text of the printing
                          andtypesetting industry most of the standard.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <h4
                  className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-30px"
                  data-aos="fade-up"
                >
                  Experience is over the world visit
                </h4>
                <p
                  className="text-lg text-darkdeep4 mb-30px !leading-30px"
                  data-aos="fade-up"
                >
                  We have covered many special events such as fireworks, fairs,
                  parades, races, walks, awards ceremonies, fashion shows,
                  sporting events, and even a memorial service
                </p>
                <p
                  className="text-lg text-darkdeep4 mb-30px !leading-30px"
                  data-aos="fade-up"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget
                  viverra pretium, dolor tellus aliquet nunc, vitae ultricies
                  erat elit eu lacus. Vestibulum non justo consectetur, cursus
                  ante, tincidunt sapien. Nulla quis diam sit amet turpis
                  interdum accumsan quis nec enim. Vivamus faucibus ex sed nibh
                  egestas elementum. Mauris et bibendum dui. Aenean consequat
                  pulvinar luctus. Suspendisse consectetur tristique tortor
                </p>

                {/* tag and share  */}
                <BlogTagsAndSocila />
                {/* previous comment area */}
                <ClientComment />
                {/* write comment area */}
                <CommentFome />
              </div>
            </div>
          </div>
          {/* blog sidebar */}
          <div className="lg:col-start-9 lg:col-span-4">
            <BlogsSidebar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetails;
