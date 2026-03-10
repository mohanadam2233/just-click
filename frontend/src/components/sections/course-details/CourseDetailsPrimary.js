// import Link from "next/link";
// // Importing your existing animated icon components
// import BalbImage from "@/components/shared/animaited-images/BalbImage";
// import BookImage from "@/components/shared/animaited-images/BookImage";
// import GlobImage from "@/components/shared/animaited-images/GlobImage";

// const CourseDetails = () => {
//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
//       {/* Hero Banner Section */}
//       <section className="relative overflow-hidden bg-blueDark py-16 lg:py-24">
//         {/* Animated Background Icons - Matching your Hero3 style */}
//         <div className="opacity-30">
//           <BookImage />
//           <GlobImage />
//           <BalbImage />
//         </div>

//         <div className="container relative z-10">
//           <div className="max-w-4xl" data-aos="fade-up">
//             {/* Breadcrumb / Tags */}
//             <div className="flex flex-wrap gap-2 mb-6">
//               {["CS101", "Engineering", "Fall 2024"].map((tag) => (
//                 <span
//                   key={tag}
//                   className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider"
//                 >
//                   {tag}
//                 </span>
//               ))}
//               <span className="px-4 py-1 bg-secondaryColor/20 border border-secondaryColor/30 text-secondaryColor rounded-full text-xs font-bold uppercase tracking-wider">
//                 Enabled
//               </span>
//             </div>

//             <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
//               Introduction to{" "}
//               <span className="text-secondaryColor">Computer Science</span>
//             </h1>

//             <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mb-10">
//               Dive into the foundational concepts of programming, algorithms,
//               and computational thinking using industry-standard tools and
//               methodologies.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Main Content Area */}
//       <main className="container py-12 lg:py-20">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//           {/* Left Side: Course Info */}
//           <div className="lg:col-span-8 space-y-12">
//             {/* About Section */}
//             <section data-aos="fade-up">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-1 h-8 bg-secondaryColor rounded-full"></div>
//                 <h2 className="text-3xl font-bold text-blackColor dark:text-white">
//                   About this course
//                 </h2>
//               </div>
//               <div className="text-paragraphColor dark:text-gray-400 text-lg leading-relaxed space-y-6">
//                 <p>
//                   This comprehensive course provides a solid foundation for
//                   students pursuing a career in technology and engineering. We
//                   cover everything from binary logic and hardware architecture
//                   to high-level programming concepts in Python and C++.
//                 </p>
//                 <div className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
//                   <h4 className="text-xl font-bold text-blackColor dark:text-white mb-4">
//                     Learning Outcomes
//                   </h4>
//                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {[
//                       "Master fundamental data structures",
//                       "Understand Big O notation",
//                       "Design terminal applications",
//                       "Collaborate using Git/GitHub",
//                     ].map((item, i) => (
//                       <li key={i} className="flex items-start gap-2">
//                         <i className="icofont-check-circled text-secondaryColor mt-1"></i>
//                         <span>{item}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </section>

//             {/* Course Meta Grid */}
//             <section
//               className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900"
//               data-aos="fade-up"
//             >
//               {[
//                 { label: "Department", value: "School of Engineering" },
//                 { label: "Semester", value: "Fall 2024" },
//                 { label: "Course Code", value: "ENG-CS-101-A" },
//                 { label: "Credits", value: "4.0 Credits" },
//                 { label: "Education Body", value: "Global Tech University" },
//                 { label: "Catalog ID", value: "#99201-B2" },
//               ].map((info, idx) => (
//                 <div key={idx}>
//                   <p className="text-xs font-bold text-secondaryColor uppercase tracking-widest mb-1">
//                     {info.label}
//                   </p>
//                   <p className="font-bold text-blackColor dark:text-white">
//                     {info.value}
//                   </p>
//                 </div>
//               ))}
//             </section>
//           </div>

//           {/* Right Side: Sidebar Actions */}
//           <div className="lg:col-span-4">
//             <div className="sticky top-28 space-y-6">
//               {/* Quick Action Card - Glassmorphism style from your Registration page */}
//               <div
//                 className="bg-blueDark p-8 rounded-2xl shadow-2xl relative overflow-hidden"
//                 data-aos="fade-left"
//               >
//                 <h3 className="text-xl font-bold text-white mb-6 relative z-10">
//                   Quick Actions
//                 </h3>
//                 <div className="space-y-4 relative z-10">
//                   <button className="w-full py-4 bg-secondaryColor hover:bg-white text-white hover:text-secondaryColor font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
//                     <i className="icofont-read-book-alt"></i> Enroll Now
//                   </button>
//                   <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-lg transition-all duration-300">
//                     Download Syllabus
//                   </button>
//                 </div>
//                 {/* Decorative blur background */}
//                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondaryColor/20 rounded-full blur-3xl"></div>
//               </div>

//               {/* AI Tutor Promo */}
//               <div
//                 className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-secondaryColor/20"
//                 data-aos="fade-left"
//                 data-aos-delay="100"
//               >
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 bg-secondaryColor rounded-xl flex items-center justify-center text-white text-2xl">
//                     <i className="icofont-robot"></i>
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-blackColor dark:text-white">
//                       Ask AI Tutor
//                     </h4>
//                     <p className="text-xs text-secondaryColor font-bold">
//                       24/7 Support
//                     </p>
//                   </div>
//                 </div>
//                 <p className="text-sm text-paragraphColor dark:text-gray-400 mb-6">
//                   Confused about binary logic? Ask our AI assistant for an
//                   instant explanation.
//                 </p>
//                 <Link
//                   href="/ai-tutor"
//                   className="block text-center py-3 border-2 border-secondaryColor text-secondaryColor hover:bg-secondaryColor hover:text-white font-bold rounded-lg transition-all"
//                 >
//                   Start Learning
//                 </Link>
//               </div>

//               {/* Capacity Tracker */}
//               <div className="px-4 text-center">
//                 <div className="flex justify-between text-sm font-bold mb-2">
//                   <span className="text-paragraphColor">
//                     Enrollment Capacity
//                   </span>
//                   <span className="text-blackColor dark:text-white">85%</span>
//                 </div>
//                 <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                   <div className="h-full bg-secondaryColor w-[85%]"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default CourseDetails;
