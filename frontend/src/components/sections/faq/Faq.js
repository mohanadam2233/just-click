"use client";

import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "Is it really free for students?",
    answer:
      "Yes. Students can create an account and access approved materials published by their department admin.",
  },
  {
    question: "Do I need internet all the time?",
    answer:
      "Yes — you need internet to browse the portal and use JustClick AI. If you download a file, you can open that saved copy offline later.",
  },
  {
    question: "How does JustClick AI work?",
    answer:
      "Open any material and use the AI assistant to summarize content, generate quiz questions, or ask about what you are reading. Answers are based on that material's uploaded files.",
  },
  {
    question: "Who uploads the materials?",
    answer:
      "Department admins upload and organize official materials for their faculty and department. Students access what is published for their semester.",
  },
  {
    question: "How do I get access after registering?",
    answer:
      "After you verify your email, a department admin reviews and approves your account. Once approved, you can sign in and browse materials.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 lg:py-100px bg-white dark:bg-gray-900">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          {/* Left */}
          <div className="lg:col-span-3" data-aos="fade-up">
            <div className="lg:relative">
              <h4 className="text-6xl lg:text-8xl text-lightGrey dark:text-blackColor-dark opacity-30 uppercase font-bold leading-[1]">
                FAQ
              </h4>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-9" data-aos="fade-up">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-borderColor dark:border-borderColor-dark rounded-2xl overflow-hidden bg-lightGrey10 dark:bg-lightGrey10-dark"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-blackColor dark:text-whiteColor hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-lg">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 text-secondaryColor ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-5 text-paragraphColor dark:text-contentColor-dark">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div
              className="mt-12 text-center bg-gradient-to-r from-primaryColor to-secondaryColor rounded-2xl p-8 md:p-12"
              data-aos="fade-up"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to study smarter this semester?
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Stop searching and start learning — everything is organized in
                one place with AI on every material.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ButtonPrimary
                  path="/signup"
                  className="bg-white text-primaryColor hover:bg-gray-100 border-0"
                >
                  Create free account
                </ButtonPrimary>

                <Link
                  href="/login"
                  className="px-8 py-4 text-white border-2 border-white/30 rounded-lg hover:bg-white/10 transition-colors font-medium"
                >
                  Log in →
                </Link>
              </div>

              <p className="text-white/70 text-sm mt-6">
                Takes less than 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
