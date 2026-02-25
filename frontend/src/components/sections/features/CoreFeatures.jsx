import React from "react";

const features = [
  {
    icon: "📚",
    title: "Smart Organization",
    description: "Faculty → Department → Semester → Course → Chapter.",
    tone: "blue",
  },
  {
    icon: "🤖",
    title: "AI Study Assistant",
    description: "Ask questions and get clear explanations when you get stuck.",
    tone: "purple",
  },
  {
    icon: "📝",
    title: "Revision Mode",
    description: "Past exams + solutions grouped for finals preparation.",
    tone: "green",
  },
  {
    icon: "🔔",
    title: "Smart Announcements",
    description: "Generate a ready message + WhatsApp link for class groups.",
    tone: "orange",
  },
];

const toneClasses = {
  blue: "bg-blue-100 dark:bg-blue-900/20",
  purple: "bg-purple-100 dark:bg-purple-900/20",
  green: "bg-green-100 dark:bg-green-900/20",
  orange: "bg-orange-100 dark:bg-orange-900/20",
};

const CoreFeatures = () => {
  return (
    <section id="features" className="py-20 lg:py-100px bg-lightGrey11 dark:bg-lightGrey11-dark">
      <div className="container">
        <div className="text-center mb-10 md:mb-50px" data-aos="fade-up">
          <span className="text-sm font-semibold text-primaryColor bg-whitegrey3 dark:bg-gray-800 dark:text-primaryColor/90 px-6 py-5px mb-5 rounded-full inline-block">
            Core Features
          </span>
          <h3 className="text-3xl md:text-4xl font-bold text-blackColor dark:text-white leading-tight">
            Everything you need, <span className="text-secondaryColor">nothing you don&apos;t</span>.
          </h3>
          <p className="mt-4 text-paragraphColor dark:text-gray-300 max-w-2xl mx-auto">
            Clean, fast, and focused—designed for real coursework and real deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-30px">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 p-30px rounded-2xl hover:shadow-experience dark:hover:shadow-gray-800/50 transition-all duration-300 hover:-translate-y-2 border border-black/5 dark:border-white/10"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div
                className={`w-16 h-16 mb-6 rounded-xl ${toneClasses[feature.tone]} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>

              <h4 className="text-xl md:text-2xl font-bold text-blackColor dark:text-white mb-4 group-hover:text-primaryColor transition-colors">
                {feature.title}
              </h4>

              <p className="text-paragraphColor dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-6 w-12 h-1 bg-secondaryColor rounded opacity-50 group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;