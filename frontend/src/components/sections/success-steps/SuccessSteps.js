import React from 'react';

const SuccessSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Sign Up Free",
      description: "Use your University ID/Email to create a secure account in seconds"
    },
    {
      number: 2,
      title: "Select Your Semester",
      description: "Follow your specific IT path (Semester 1–8) to see only what you need"
    },
    {
      number: 3,
      title: "Start Excelling",
      description: "Download slides, view past exams, and stay ahead of the curve"
    }
  ];

  return (
    <section className="bg-slate-50 py-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header Section */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-4">
          <span className="text-[#3b82f6]">3 Simple Steps</span> to Success
        </h2>
        <p className="text-slate-500 text-lg md:text-xl mb-16">
          Get started with your personalized learning experience in minutes
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Gradient Box */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-200 mb-8 transition-transform hover:scale-105 duration-300">
                <span className="text-white text-4xl md:text-5xl font-bold">
                  {step.number}
                </span>
              </div>

              {/* Text Content */}
              <h3 className="text-xl md:text-2xl font-bold text-[#1e293b] mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessSteps;