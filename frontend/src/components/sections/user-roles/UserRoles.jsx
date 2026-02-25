import React from "react";
import Link from "next/link";

const UserRoles = () => {
  return (
    <section id="roles" className="py-20 lg:py-100px bg-white dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-10 md:mb-50px" data-aos="fade-up">
          <span className="text-sm font-semibold text-primaryColor bg-whitegrey3 dark:bg-gray-800 dark:text-primaryColor/90 px-6 py-5px mb-5 rounded-full inline-block">
            Who It&apos;s For
          </span>
          <h3 className="text-3xl md:text-4xl font-bold text-blackColor dark:text-white leading-tight">
            Built for <span className="text-secondaryColor">students</span> and{" "}
            <span className="text-secondaryColor">lecturers</span>.
          </h3>
          <p className="mt-4 text-paragraphColor dark:text-gray-300 max-w-2xl mx-auto">
            Students get clarity. Lecturers save time. Everyone stays aligned.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px">
          {/* Students */}
          <div
            className="group bg-lightGrey10 dark:bg-lightGrey10-dark p-30px rounded-2xl hover:shadow-experience dark:hover:shadow-gray-800/50 transition-all duration-300 border border-black/5 dark:border-white/10"
            data-aos="fade-right"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                👨‍🎓
              </div>
              <h4 className="text-2xl font-bold text-blackColor dark:text-white">For Students</h4>
            </div>

            <div className="space-y-4">
              {[
                "Materials organized for your semester",
                "Favorites for fast revision",
                "Progress tracker per course",
                "Offline downloads",
                "AI help when you’re stuck",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-secondaryColor">✓</span>
                  <span className="text-paragraphColor dark:text-contentColor-dark">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-primaryColor dark:text-primaryColor font-semibold hover:gap-3 transition-all"
              >
                Create student account <span>→</span>
              </Link>
            </div>
          </div>

          {/* Lecturers */}
          <div
            className="group bg-lightGrey10 dark:bg-lightGrey10-dark p-30px rounded-2xl hover:shadow-experience dark:hover:shadow-gray-800/50 transition-all duration-300 border border-black/5 dark:border-white/10"
            data-aos="fade-left"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <h4 className="text-2xl font-bold text-blackColor dark:text-white">For Lecturers</h4>
            </div>

            <div className="space-y-4">
              {[
                "Upload once (PDF, PPT, DOC, video)",
                "WhatsApp-ready announcements",
                "Forum reduces repeated questions",
                "Engagement insights",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-secondaryColor">✓</span>
                  <span className="text-paragraphColor dark:text-contentColor-dark">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/lecturer-info"
                className="inline-flex items-center gap-2 text-primaryColor dark:text-primaryColor font-semibold hover:gap-3 transition-all"
              >
                Learn more <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserRoles;