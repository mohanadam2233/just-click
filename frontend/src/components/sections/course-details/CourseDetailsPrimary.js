// import CourseDetailsSidebar from "@/components/shared/courses/CourseDetailsSidebar";
// import Image from "next/image";

// import CommentFome from "@/components/shared/forms/CommentFome";
// import CourseDetailsTab from "@/components/shared/course-details/CourseDetailsTab";
// import InstrutorOtherCourses from "@/components/shared/course-details/InstrutorOtherCourses";
// import getAllCourses from "@/libs/getAllCourses";

// // ✅ ADD THIS (update the path to where your image is)
// import blogImag8 from "@/assets/images/blog/blog_8.png";

// let cid = 0;

// const CourseDetailsPrimary = ({ id: currentId, type }) => {
//   const allCourses = getAllCourses();
//   const course = allCourses?.find(({ id }) => parseInt(currentId) === id);

//   if (!course) {
//     return (
//       <section>
//         <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
//           <div className="max-w-xl mx-auto text-center">
//             <h4 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-3">
//               Course not found
//             </h4>
//             <p className="text-contentColor dark:text-contentColor-dark">
//               The course you’re trying to open doesn’t exist or the ID is invalid.
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   const { title, price, lesson, insName, categories, id } = course;

//   const safeId =
//     typeof id === "number" && !Number.isNaN(id) ? id : parseInt(currentId) || 1;

//   cid = safeId;
//   cid = cid % 6 ? cid % 6 : 6;

//   return (
//     <section>
//       <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
//           <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
//             <div data-aos="fade-up">
//               {type === 2 || type === 3 ? (
//                 ""
//               ) : (
//                 <div className="overflow-hidden relative mb-5">
//                   <Image src={blogImag8} alt="" className="w-full" placeholder="blur" />
//                 </div>
//               )}

//               <div>
//                 {type === 2 || type === 3 ? (
//                   ""
//                 ) : (
//                   <>
//                     <div
//                       className="flex items-center justify-between flex-wrap gap-6 mb-30px"
//                       data-aos="fade-up"
//                     >
//                       <div className="flex items-center gap-6">
//                         <button className="text-sm text-whiteColor bg-primaryColor border border-primaryColor px-26px py-0.5 leading-23px font-semibold hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor">
//                           Featured
//                         </button>
//                         <button className="text-sm text-whiteColor bg-indigo border border-indigo px-22px py-0.5 leading-23px font-semibold hover:text-indigo hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-indigo">
//                           {categories}
//                         </button>
//                       </div>
//                       <div>
//                         <p className="text-sm text-contentColor dark:text-contentColor-dark font-medium">
//                           Last Update:{" "}
//                           <span className="text-blackColor dark:text-blackColor-dark">
//                             Sep 29, 2024
//                           </span>
//                         </p>
//                       </div>
//                     </div>

//                     <h4
//                       className="text-size-32 md:text-4xl font-bold text-blackColor dark:text-blackColor-dark mb-15px leading-43px md:leading-14.5"
//                       data-aos="fade-up"
//                     >
//                       {title || "Making Music with Other People"}
//                     </h4>

//                     <div
//                       className="flex gap-5 flex-wrap items-center mb-30px"
//                       data-aos="fade-up"
//                     >
//                       <div className="text-size-21 font-medium text-primaryColor font-inter leading-25px">
//                         ${price ? price.toFixed(2) : "32.00"}{" "}
//                         <del className="text-sm text-lightGrey4 font-semibold">
//                           / $67.00
//                         </del>
//                       </div>
//                       <div className="flex items-center">
//                         <div>
//                           <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
//                         </div>
//                         <div>
//                           <span className=" text-black dark:text-blackColor-dark">
//                             {lesson || "23 Lesson"}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-start md:text-end">
//                         <i className="icofont-star text-size-15 text-yellow"></i>{" "}
//                         <i className="icofont-star text-size-15 text-yellow"></i>{" "}
//                         <i className="icofont-star text-size-15 text-yellow"></i>{" "}
//                         <i className="icofont-star text-size-15 text-yellow"></i>
//                         <i className="icofont-star text-size-15 text-yellow"></i>{" "}
//                         <span className=" text-blackColor dark:text-blackColor-dark">
//                           (44)
//                         </span>
//                       </div>
//                     </div>

//                     <p
//                       className="text-sm md:text-lg text-contentColor dark:contentColor-dark mb-25px !leading-30px"
//                       data-aos="fade-up"
//                     >
//                       Lorem ipsum dolor sit amet, consectetur adipiscing elit.
//                       Curabitur vulputate vestibulum rhoncus, dolor eget viverra
//                       pretium, dolor tellus aliquet nunc, vitae ultricies erat
//                       elit eu lacus. Vestibulum non justo consectetur, cursus
//                       ante, tincidunt sapien. Nulla quis diam sit amet turpis
//                       interd enim. Vivamus faucibus ex sed nibh egestas
//                       elementum. Mauris et bibendum dui. Aenean consequat
//                       pulvinar luctus. Suspendisse consectetur tristique
//                     </p>

//                     <div>
//                       <h4
//                         className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px"
//                         data-aos="fade-up"
//                       >
//                         Course Details
//                       </h4>

//                       <div
//                         className="bg-darkdeep3 dark:bg-darkdeep3-dark mb-30px grid grid-cols-1 md:grid-cols-2"
//                         data-aos="fade-up"
//                       >
//                         <ul className="p-10px md:py-55px md:pl-50px md:pr-70px lg:py-35px lg:px-30px 2xl:py-55px 2xl:pl-50px 2xl:pr-70px border-r-2 border-borderColor dark:border-borderColor-dark space-y-[10px]">
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Instructor :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 {insName || "Mirnsdo.H"}
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Lectures :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 120 sub
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Duration :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 {"20h 41m 32s"}
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Enrolled :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 2 students
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Total :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 222 students
//                               </span>
//                             </p>
//                           </li>
//                         </ul>
//                         <ul className="p-10px md:py-55px md:pl-50px md:pr-70px lg:py-35px lg:px-30px 2xl:py-55px 2xl:pl-50px 2xl:pr-70px border-r-2 border-borderColor dark:border-borderColor-dark space-y-[10px]">
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Course level :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 Intermediate
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Language :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 English spanish
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Price Discount :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 -20%
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Regular Price :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 $228/Mo
//                               </span>
//                             </p>
//                           </li>
//                           <li>
//                             <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
//                               Course Status :
//                               <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
//                                 Available
//                               </span>
//                             </p>
//                           </li>
//                         </ul>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <CourseDetailsTab id={cid} type={type} />

//                 <div className="md:col-start-5 md:col-span-8 mb-5">
//                   <h4
//                     className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-38px"
//                     data-aos="fade-up"
//                   >
//                     Why search Is Important ?
//                   </h4>
//                   <ul className="space-y-[15px] max-w-127">
//                     <li className="flex items-center group" data-aos="fade-up">
//                       <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
//                       <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
//                         Lorem Ipsum is simply dummying text of the printing andtypesetting industry most of the standard.
//                       </p>
//                     </li>
//                     <li className="flex items-center group" data-aos="fade-up">
//                       <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
//                       <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
//                         Lorem Ipsum is simply dummying text of the printing andtypesetting industry most of the standard.
//                       </p>
//                     </li>
//                     <li className="flex items-center group" data-aos="fade-up">
//                       <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
//                       <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
//                         Lorem Ipsum is simply dummying text of the printing andtypesetting industry most of the standard.
//                       </p>
//                     </li>
//                     <li className="flex items-center group" data-aos="fade-up">
//                       <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
//                       <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
//                         Lorem Ipsum is simply dummying text of the printing andtypesetting industry most of the standard.
//                       </p>
//                     </li>
//                   </ul>
//                 </div>

//                 <InstrutorOtherCourses />
//                 <CommentFome />
//               </div>
//             </div>
//           </div>

//           <div
//             className={`lg:col-start-9 lg:col-span-4 ${
//               type === 2 || type === 3 ? "relative lg:top-[-340px]" : ""
//             }`}
//           >
//             <CourseDetailsSidebar type={type} course={course} />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CourseDetailsPrimary;

import React from "react";
import Image from "next/image";
import Link from "next/link";
// Importing your existing animated icon components
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";

const CourseDetails = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-blueDark py-16 lg:py-24">
        {/* Animated Background Icons - Matching your Hero3 style */}
        <div className="opacity-30">
          <BookImage />
          <GlobImage />
          <BalbImage />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl" data-aos="fade-up">
            {/* Breadcrumb / Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["CS101", "Engineering", "Fall 2024"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
              <span className="px-4 py-1 bg-secondaryColor/20 border border-secondaryColor/30 text-secondaryColor rounded-full text-xs font-bold uppercase tracking-wider">
                Enabled
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Introduction to{" "}
              <span className="text-secondaryColor">Computer Science</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mb-10">
              Dive into the foundational concepts of programming, algorithms,
              and computational thinking using industry-standard tools and
              methodologies.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-secondaryColor hover:bg-white text-white hover:text-secondaryColor px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-secondaryColor/30 flex items-center gap-2">
                <i className="icofont-folder mr-1"></i>
                Browse Materials
              </button>
              <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-lg font-bold transition-all duration-300 flex items-center gap-2">
                <i className="icofont-plus mr-1"></i>
                Add to My Courses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Course Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* About Section */}
            <section data-aos="fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-secondaryColor rounded-full"></div>
                <h2 className="text-3xl font-bold text-blackColor dark:text-white">
                  About this course
                </h2>
              </div>
              <div className="text-paragraphColor dark:text-gray-400 text-lg leading-relaxed space-y-6">
                <p>
                  This comprehensive course provides a solid foundation for
                  students pursuing a career in technology and engineering. We
                  cover everything from binary logic and hardware architecture
                  to high-level programming concepts in Python and C++.
                </p>
                <div className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-xl font-bold text-blackColor dark:text-white mb-4">
                    Learning Outcomes
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Master fundamental data structures",
                      "Understand Big O notation",
                      "Design terminal applications",
                      "Collaborate using Git/GitHub",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <i className="icofont-check-circled text-secondaryColor mt-1"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Course Meta Grid */}
            <section
              className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900"
              data-aos="fade-up"
            >
              {[
                { label: "Department", value: "School of Engineering" },
                { label: "Semester", value: "Fall 2024" },
                { label: "Course Code", value: "ENG-CS-101-A" },
                { label: "Credits", value: "4.0 Credits" },
                { label: "Education Body", value: "Global Tech University" },
                { label: "Catalog ID", value: "#99201-B2" },
              ].map((info, idx) => (
                <div key={idx}>
                  <p className="text-xs font-bold text-secondaryColor uppercase tracking-widest mb-1">
                    {info.label}
                  </p>
                  <p className="font-bold text-blackColor dark:text-white">
                    {info.value}
                  </p>
                </div>
              ))}
            </section>
          </div>

          {/* Right Side: Sidebar Actions */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Quick Action Card - Glassmorphism style from your Registration page */}
              <div
                className="bg-blueDark p-8 rounded-2xl shadow-2xl relative overflow-hidden"
                data-aos="fade-left"
              >
                <h3 className="text-xl font-bold text-white mb-6 relative z-10">
                  Quick Actions
                </h3>
                <div className="space-y-4 relative z-10">
                  <button className="w-full py-4 bg-secondaryColor hover:bg-white text-white hover:text-secondaryColor font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="icofont-read-book-alt"></i> Enroll Now
                  </button>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-lg transition-all duration-300">
                    Download Syllabus
                  </button>
                </div>
                {/* Decorative blur background */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondaryColor/20 rounded-full blur-3xl"></div>
              </div>

              {/* AI Tutor Promo */}
              <div
                className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-secondaryColor/20"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-secondaryColor rounded-xl flex items-center justify-center text-white text-2xl">
                    <i className="icofont-robot"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-blackColor dark:text-white">
                      Ask AI Tutor
                    </h4>
                    <p className="text-xs text-secondaryColor font-bold">
                      24/7 Support
                    </p>
                  </div>
                </div>
                <p className="text-sm text-paragraphColor dark:text-gray-400 mb-6">
                  Confused about binary logic? Ask our AI assistant for an
                  instant explanation.
                </p>
                <Link
                  href="/ai-tutor"
                  className="block text-center py-3 border-2 border-secondaryColor text-secondaryColor hover:bg-secondaryColor hover:text-white font-bold rounded-lg transition-all"
                >
                  Start Learning
                </Link>
              </div>

              {/* Capacity Tracker */}
              <div className="px-4 text-center">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-paragraphColor">
                    Enrollment Capacity
                  </span>
                  <span className="text-blackColor dark:text-white">85%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-secondaryColor w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
