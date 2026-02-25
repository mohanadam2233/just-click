import React from "react";
import LoginForm from "@/components/shared/login/LoginForm";
import Image from "next/image";
import shapImage2 from "@/assets/images/education/hero_shape2.png";
import shapImage3 from "@/assets/images/education/hero_shape3.png";
import shapImage4 from "@/assets/images/education/hero_shape4.png";
import shapImage5 from "@/assets/images/education/hero_shape5.png";

const LoginTab = () => {
  return (
    <section className="relative">
      <div className="container py-16 md:py-100px">
        <div className="tab md:w-2/3 mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-700">
            <LoginForm />
          </div>
        </div>
      </div>
      <div>
        <Image
          loading="lazy"
          className="absolute right-[14%] top-[30%] animate-move-var"
          src={shapImage2}
          alt="Shape"
        />
        <Image
          loading="lazy"
          className="absolute left-[5%] top-1/2 animate-move-hor"
          src={shapImage3}
          alt="Shape"
        />
        <Image
          loading="lazy"
          className="absolute left-1/2 bottom-[60px] animate-spin-slow"
          src={shapImage4}
          alt="Shape"
        />
        <Image
          loading="lazy"
          className="absolute left-1/2 top-10 animate-spin-slow"
          src={shapImage5}
          alt="Shape"
        />
      </div>
    </section>
  );
};

export default LoginTab;
