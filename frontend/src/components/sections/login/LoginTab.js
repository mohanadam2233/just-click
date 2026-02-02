"use client";
import TabButtonPrimary from "@/components/shared/buttons/TabButtonPrimary";
import LoginForm from "@/components/shared/login/LoginForm";
import SignUpForm from "@/components/shared/login/SignUpForm";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import Image from "next/image";
import shapImage2 from "@/assets/images/education/hero_shape2.png";
import shapImage3 from "@/assets/images/education/hero_shape3.png";
import shapImage4 from "@/assets/images/education/hero_shape4.png";
import shapImage5 from "@/assets/images/education/hero_shape5.png";
import useTab from "@/hooks/useTab";

const LoginTab = () => {
  const { currentIdx, handleTabClick } = useTab();
  const tabButtons = [
    { name: "Login", content: <LoginForm /> },
    {
      name: " Sing up",
      content: <SignUpForm />,
    },
  ];
  return (
    <section className="relative">
      <div className="container py-100px">
        <div className="tab md:w-2/3 mx-auto">
          {/* tab controller */}

          <div className="tab-links grid grid-cols-2 gap-11px text-blackColor text-lg lg:text-size-22 font-semibold font-hind mb-43px mt-30px md:mt-0">
            {tabButtons?.map(({ name }, idx) => (
              <TabButtonPrimary
                key={idx}
                idx={idx}
                handleTabClick={handleTabClick}
                currentIdx={currentIdx}
                button={"lg"}
                name={name}
              />
            ))}
          </div>

          {/* tab contents */}
          <div className="shadow-container bg-whiteColor dark:bg-whiteColor-dark pt-10px px-5 pb-10 md:p-50px md:pt-30px rounded-5px">
            <div className="tab-contents">
              {tabButtons.map(({ content }, idx) => (
                <TabContentWrapper
                  key={idx}
                  isShow={idx === currentIdx || false}
                >
                  {content}
                </TabContentWrapper>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* animated icons */}
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
