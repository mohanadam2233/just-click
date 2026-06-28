import React from "react";

const ProblemFix = () => {
  const pain = [
    "Materials buried in chat history",
    "Different versions, no single source",
    "Hard to find the right file when exams approach",
  ];

  const gain = [
    "One verified repository for your department",
    "Organized by semester → course → chapter",
    "Searchable materials with AI-assisted learning",
  ];

  return (
    <section id="problem" className="py-20 lg:py-100px bg-white dark:bg-gray-900">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px">
          {/* Problem */}
          <div
            className="bg-lightGrey10 dark:bg-lightGrey10-dark p-30px rounded-2xl border border-black/5 dark:border-white/10"
            data-aos="fade-right"
          >
            <span className="text-sm font-semibold text-secondaryColor uppercase tracking-wider mb-4 block">
              The problem
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-blackColor dark:text-white mb-6">
              WhatsApp chaos ends here.
            </h3>

            <div className="space-y-4">
              {pain.map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 dark:text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-paragraphColor dark:text-contentColor-dark">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div
            className="bg-lightGrey10 dark:bg-lightGrey10-dark p-30px rounded-2xl border border-black/5 dark:border-white/10"
            data-aos="fade-left"
          >
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-4 block">
              The fix
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-blackColor dark:text-white mb-6">
              One portal, all materials.
            </h3>

            <div className="space-y-4">
              {gain.map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-paragraphColor dark:text-contentColor-dark">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-50px text-center">
          <p className="text-lg md:text-xl text-paragraphColor dark:text-contentColor-dark max-w-3xl mx-auto leading-relaxed">
            <span className="font-bold text-blackColor dark:text-white">JustClick</span>{" "}
            turns scattered files into a structured learning hub — built for your
            department, with AI help on every material.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemFix;
