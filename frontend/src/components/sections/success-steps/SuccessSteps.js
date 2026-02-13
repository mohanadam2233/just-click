
import React from "react";

const SuccessSteps = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up instantly using your University ID. It's secure, fast, and connects you directly to the IT department database.",
      iconClass: "icofont-id-card",
    },
    {
      number: "02",
      title: "Select Your Semester",
      description: "Choose your specific academic path (Semester 1–8). The system automatically filters content so you only see what you need.",
      iconClass: "icofont-read-book",
    },
    {
      number: "03",
      title: "Start Learning",
      description: "Download PDF slides, view past exams, and chat with the AI assistant to clarify difficult topics before your finals.",
      iconClass: "icofont-graduate-alt",
    }
  ];

  return (
    <section className="py-20 lg:py-100px bg-white dark:bg-gray-900 relative z-0">
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-50px" data-aos="fade-up">
          <span className="text-sm font-semibold text-primaryColor bg-whitegrey3 dark:bg-gray-800 dark:text-primaryColor/90 px-6 py-5px mb-5 rounded-full inline-block">
            How It Works
          </span>
          <h3 className="text-3xl md:text-4xl font-bold text-blackColor dark:text-white leading-tight">
            Master Your Coursework in <span className="text-secondaryColor">3 Simple Steps</span>
          </h3>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-30px">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative bg-lightGrey10 dark:bg-gray-800/90 p-30px rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-experience dark:hover:shadow-gray-800/50 border border-transparent dark:border-gray-700"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Step Number Badge */}
              <div className="absolute top-0 right-0 bg-secondaryColor text-white text-lg font-bold px-4 py-2 rounded-bl-lg rounded-tr-lg">
                {step.number}
              </div>

              {/* Icon / Visual */}
              <div className="w-16 h-16 mb-6 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-3xl text-primaryColor shadow-sm group-hover:bg-primaryColor group-hover:text-white transition-colors duration-300 dark:group-hover:bg-primaryColor dark:group-hover:text-white">
                <i className={`${step.iconClass}`}></i>
              </div>

              {/* Text Content */}
              <h4 className="text-xl md:text-2xl font-bold text-blackColor dark:text-white mb-4 group-hover:text-primaryColor transition-colors">
                {step.title}
              </h4>
              <p className="text-paragraphColor dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
              
              {/* Decorative Line */}
              <div className="mt-6 w-12 h-1 bg-secondaryColor rounded opacity-50 group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessSteps;