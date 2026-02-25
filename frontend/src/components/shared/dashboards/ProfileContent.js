import React from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";

const ProfileContent = () => {
  return (
    <form
      className="text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
      data-aos="fade-up"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 mb-15px gap-y-15px gap-x-30px">
        <div>
          <label className="mb-3 block font-semibold">First Name</label>
          <input
            type="text"
            placeholder="John"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Last Name</label>
          <input
            type="text"
            placeholder="Due"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">User Name</label>
          <input
            type="text"
            placeholder="Ntaden Mic"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Phone Number</label>
          <input
            type="text"
            placeholder="+1-202-555-0174"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Skill/Occupation</label>
          <input
            type="text"
            placeholder="Full Stack Developer"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">
            Display Name Publicly As
          </label>
          <input
            type="text"
            placeholder="John"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
      </div>
      <div className="mb-15px">
        <label className="mb-3 block font-semibold">Bio</label>
        <textarea
          className="w-full py-10px px-5 text-sm text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
          cols="30"
          rows="10"
          defaultValue={
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
          }
        />
      </div>

      <div className="mt-15px">
        <ButtonPrimary type={"submit"}>Update Info</ButtonPrimary>
      </div>
    </form>
  );
};

export default ProfileContent;
