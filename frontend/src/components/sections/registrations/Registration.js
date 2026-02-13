
import Image from "next/image";
import React from "react";
import registrationImage1 from "@/assets/images/register/register__1.png";
import registrationImage2 from "@/assets/images/register/register__2.png";
import registrationImage3 from "@/assets/images/register/register__3.png";
import Link from "next/link";

const Registration = () => {
  return (
    <section className="bg-register bg-cover bg-center bg-no-repeat lg:mb-150px">
      {/* Registration Overlay */}
      <div className="overlay bg-blueDark bg-opacity-95 lg:pb-0 relative z-0">
        {/* Animated Icons Background */}
        <div>
          <Image
            className="absolute top-0 left-0 lg:left-[8%] 2xl:top-10 animate-move-hor block z--1 opacity-40"
            src={registrationImage1}
            alt=""
          />
          <Image
            className="absolute top-1/2 left-3/4 md:left-2/3 lg:left-1/2 2xl:left-[8%] md:top animate-spin-slow block z--1 opacity-40"
            src={registrationImage2}
            alt=""
          />
          <Image
            className="absolute top-20 lg:top-3/4 md:top-14 right-20 md:right-20 lg:right-[90%] animate-move-var block z--1 opacity-40"
            src={registrationImage3}
            alt=""
          />
        </div>

        <div className="container py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-30px items-center">
            
            {/* Left Side: Compelling Text */}
            <div
              className="mb-10 lg:mb-0 lg:col-start-1 lg:col-span-7"
              data-aos="fade-up"
            >
              <div className="relative">
                <span className="text-sm font-bold text-blackColor bg-secondaryColor px-4 py-1 mb-5 rounded-md inline-block uppercase tracking-wider">
                  Student Portal Access
                </span>
                <h3 className="text-3xl md:text-5xl font-bold text-whiteColor mb-6 leading-tight">
                  Unlock Your <span className="text-secondaryColor">Full Potential</span> with Centralized Resources
                </h3>
                
                <p className="text-lg text-whiteColor/90 leading-relaxed font-medium max-w-2xl">
                  Join hundreds of IT students accessing verified lecture notes, 
                  past exams, and our new AI Study Assistant. Stop searching for 
                  files—start studying.
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-4 mt-8">
                    {['Free Account', 'Instant Access', 'Mobile Friendly'].map((tag, i) => (
                        <span key={i} className="flex items-center text-whiteColor text-sm font-semibold bg-whiteColor/10 px-3 py-2 rounded-lg border border-whiteColor/10">
                            <i className="icofont-check-circled text-secondaryColor mr-2"></i>
                            {tag}
                        </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Side: CTA Card */}
            <div className="lg:col-start-8 lg:col-span-5 relative z-1 flex justify-center lg:justify-end">
              <div 
                className="bg-whiteColor/5 backdrop-blur-sm border border-whiteColor/10 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center"
                data-aos="fade-up" 
                data-aos-delay="150"
              >
                <h4 className="text-2xl font-bold text-whiteColor mb-2">Ready to start?</h4>
                <p className="text-whiteColor/70 mb-8">Create your student profile in less than 2 minutes.</p>
                
                <Link
                  href="/login"
                  className="group relative block w-full py-4 px-6 bg-secondaryColor hover:bg-whiteColor text-whiteColor hover:text-secondaryColor font-bold text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-secondaryColor/50"
                >
                  Create Free Account
                  <i className="icofont-long-arrow-right ml-2 group-hover:ml-3 transition-all"></i>
                </Link>

                <div className="mt-6 pt-6 border-t border-whiteColor/10">
                    <p className="text-whiteColor/60 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-secondaryColor font-bold hover:underline">
                            Log In Here
                        </Link>
                    </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;