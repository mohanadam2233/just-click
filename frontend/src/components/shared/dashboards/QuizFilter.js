import React from "react";

const QuizFilter = () => {
  return (
    <div className="grid grid-cols md:grid-cols-3 xl:grid-cols-12 gap-x-30px">
      <div className="xl:col-start-1 xl:col-span-6">
        <p className="text-xs leading-1.8 tracking-[.5px] uppercase text-bodyColor dark:text-bodyColor-dark mb-6px font-semibold opacity-50">
          COURSES
        </p>
        <div className="bg-whiteColor rounded-md relative">
          <select className="bg-transparent text-darkBlue w-full p-13px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select rounded-md">
            <option defaultValue="All">All</option>
            <option defaultValue="Web Design">Web Design</option>
            <option defaultValue="Graphic">Graphic</option>
            <option defaultValue="English">English</option>
            <option defaultValue="Spoken English">Spoken English</option>
            <option defaultValue="Art Painting">Art Painting</option>
            <option defaultValue="App Development">App Development</option>
            <option defaultValue="Spoken English">Web Application</option>
            <option defaultValue="Spoken English">Php Development</option>
          </select>
          <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
        </div>
      </div>
      <div className="xl:col-start-7 xl:col-span-3">
        <p className="text-xs leading-1.8 tracking-[.5px] uppercase text-bodyColor dark:text-bodyColor-dark mb-6px font-semibold opacity-50">
          SHORT BY
        </p>
        <div className="bg-whiteColor rounded-md relative">
          <select className="bg-transparent text-darkBlue w-full p-13px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select rounded-md">
            <option defaultValue="Default">Default</option>
            <option defaultValue="Trending">Trending</option>
            <option defaultValue="Price: low to high">
              Price: low to high
            </option>
            <option defaultValue="Price: low to low">Price: low to low</option>
          </select>
          <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
        </div>
      </div>
      <div className="xl:col-start-10 xl:col-span-3">
        <p className="text-xs leading-1.8 tracking-[.5px] uppercase text-bodyColor dark:text-bodyColor-dark mb-6px font-semibold opacity-50">
          SHORT BY OFFER
        </p>
        <div className="bg-whiteColor rounded-md relative">
          <select className="bg-transparent text-darkBlue w-full p-13px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select rounded-md">
            <option defaultValue="Free">Free</option>
            <option defaultValue="paid">paid</option>
            <option defaultValue="premimum">premimum</option>
          </select>
          <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
        </div>
      </div>
    </div>
  );
};

export default QuizFilter;
