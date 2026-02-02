import React from "react";

const ProfileDetails = () => {
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark">
        <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
          My Profile
        </h2>
      </div>

      <div>
        <ul>
          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Registration Date</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">20, January 2024 9:00 PM</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">First Name</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">Michle</span>
            </div>
          </li>
          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Last Name</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">Obema</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Username</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block"> obema007</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Email</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block"> obema@example.com</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Phone Number</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">+55 669 4456 25987</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Expert</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">Graphics Design</span>
            </div>
          </li>

          <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
            <div className="md:col-start-1 md:col-span-4">
              <span className="inline-block">Biography</span>
            </div>
            <div className="md:col-start-5 md:col-span-8">
              <span className="inline-block">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Maiores veniam, delectus accusamus nesciunt laborum repellat
                laboriosam, deserunt possimus itaque iusto perferendis
                voluptatum quaerat cupiditate vitae. Esse aut illum perferendis
                nulla, corporis impedit quasi alias est!
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDetails;
